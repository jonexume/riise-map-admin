import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useGetFundingSources,
  useGetPrograms,
  useGetPathways,
  useGetLearners,
} from '@workspace/api-client-react';
import { authFetch } from '@/lib/auth-fetch';

import type {
  FundingSourceReportData,
  GoalData,
  ImpactReportData,
} from './types';

import {
  computeGoalCompletion,
  computeHealthStatus,
  computePortfolioSummary,
  computeProgressRate,
  computeProgramAggregates,
  computeTimeProgress,
  filterProgramsByFunder,
  generateTemplateNarrative,
  sortFundingSources,
  sortGoals,
} from './computations';
import type { FundingSource, Program, Pathway } from './computations';

// ---------------------------------------------------------------------------
// API goal shape (as returned by GET /api/funding-source-goals)
// ---------------------------------------------------------------------------

interface ApiFundingSourceGoal {
  id: number;
  fundingSourceId: number;
  title: string;
  note: string | null;
  status: string;
  documentFileName: string | null;
  documentFile?: unknown;
  createdAt: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Hook result interface
// ---------------------------------------------------------------------------

export interface UseImpactReportDataResult {
  isLoading: boolean;
  isError: boolean;
  data: ImpactReportData | null;
}

// ---------------------------------------------------------------------------
// Goals fetch function
// ---------------------------------------------------------------------------

async function fetchAllGoals(): Promise<ApiFundingSourceGoal[]> {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const res = await authFetch(`${baseUrl}/api/funding-source-goals`);
  if (!res.ok) throw new Error('Failed to fetch funding source goals');
  return res.json();
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useImpactReportData(): UseImpactReportDataResult {
  // Existing data hooks
  const {
    data: rawFundingSources = [],
    isLoading: fsLoading,
    isError: fsError,
  } = useGetFundingSources();

  const {
    data: rawPrograms = [],
    isLoading: progLoading,
    isError: progError,
  } = useGetPrograms();

  const {
    data: rawPathways = [],
    isLoading: pathLoading,
    isError: pathError,
  } = useGetPathways();

  const {
    data: _learners = [],
    isLoading: learnLoading,
    isError: learnError,
  } = useGetLearners();

  // Fetch all goals via React Query (consistent with other hooks)
  const {
    data: rawGoals = [],
    isLoading: goalsLoading,
    isError: goalsError,
  } = useQuery<ApiFundingSourceGoal[]>({
    queryKey: ['/api/funding-source-goals'],
    queryFn: fetchAllGoals,
  });

  // Fetch pathway-program links
  const {
    data: pathwayProgramLinks = [],
    isLoading: linksLoading,
    isError: linksError,
  } = useQuery<{ id: number; pathwayId: number; programId: number }[]>({
    queryKey: ['/api/pathway-programs'],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await authFetch(`${baseUrl}/api/pathway-programs`);
      if (!res.ok) throw new Error('Failed to fetch pathway-programs');
      return res.json();
    },
  });

  const isLoading = fsLoading || progLoading || pathLoading || learnLoading || goalsLoading || linksLoading;
  const isError = fsError || progError || pathError || learnError || goalsError || linksError;

  // Compute the report data once all data is loaded
  const data = useMemo<ImpactReportData | null>(() => {
    if (isLoading || isError) return null;

    const today = new Date();

    // Cast API types to computation input types
    const fundingSources = rawFundingSources as unknown as FundingSource[];
    const programs = rawPrograms as unknown as Program[];
    const pathways = rawPathways as unknown as Pathway[];

    // Sort funding sources by end date, then name
    const sortedSources = sortFundingSources(fundingSources);

    // Build report data for each funding source
    const fundingSourceReports: FundingSourceReportData[] = sortedSources.map(
      (fs) => {
        // 1. Filter programs linked to this funding source
        const linkedPrograms = filterProgramsByFunder(programs, fs.name);

        // 2. Filter pathways linked to linked programs via join table
        const linkedProgramIds = linkedPrograms.map((p) => p.id);
        const linkedPathwayIds = pathwayProgramLinks
          .filter((l) => linkedProgramIds.includes(l.programId))
          .map((l) => l.pathwayId);
        const linkedPathways = pathways
          .filter((pw) => linkedPathwayIds.includes(pw.id))
          .map((pw) => ({
            id: pw.id,
            name: pw.name,
            estimatedWeeks: pw.estimatedWeeks,
            activeLearners: pw.activeLearners,
            skills: Array.isArray(pw.skills) ? (pw.skills as string[]).slice(0, 15) : [],
            milestoneCount: Array.isArray(pw.milestones) ? pw.milestones.length : 0,
          }));

        // 3. Enrolled learners = count of learners whose program matches a linked program
        const linkedProgramNames = linkedPrograms.map(p => p.name);
        const enrolledLearners = _learners.filter(
          (l: any) => linkedProgramNames.includes(l.program),
        ).length;

        // 4. Goals for this funding source
        const sourceGoals: GoalData[] = rawGoals
          .filter((g) => g.fundingSourceId === Number(fs.id))
          .map((g) => ({
            id: g.id,
            title: g.title,
            status: g.status as GoalData['status'],
            note: g.note,
            documentFileName: g.documentFileName,
          }));
        const sortedGoals = sortGoals(sourceGoals);

        // 5. Compute time progress
        const timeResult = computeTimeProgress(
          fs.startDate ?? null,
          fs.endDate ?? null,
          today,
        );

        // 6. Compute progress rate
        const progressRate = computeProgressRate(
          enrolledLearners,
          fs.learnerCount ?? null,
        );

        // 7. Compute health status
        const endDate = fs.endDate ? new Date(fs.endDate) : null;
        const now = new Date();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const isExpiringSoon = endDate != null && endDate.getTime() > now.getTime() && (endDate.getTime() - now.getTime()) < thirtyDaysMs;
        const healthStatus = computeHealthStatus(
          progressRate,
          timeResult.value,
          fs.learnerCount ?? null,
          sortedGoals.length,
          timeResult.isNotStarted,
          isExpiringSoon,
        );

        // 8. Pace gap
        const paceGap =
          progressRate != null && timeResult.value != null
            ? progressRate - timeResult.value
            : null;

        // 9. Goal completion
        const goalCompletion = computeGoalCompletion(sortedGoals);

        // 10. Program aggregates
        const programAggregates = computeProgramAggregates(linkedPrograms);

        // Build the partial object (without narrative, computed after)
        const reportData: FundingSourceReportData = {
          id: Number(fs.id),
          name: fs.name,
          amount: fs.amount != null ? Number(fs.amount) : null,
          startDate: fs.startDate ?? null,
          endDate: fs.endDate ?? null,
          learnerCount: fs.learnerCount ?? null,
          objectives: fs.objectives ?? null,
          narrative: (fs as unknown as { narrative?: string | null }).narrative ?? null,

          timeProgress: timeResult.value,
          isExpired: timeResult.isExpired,
          isNotStarted: timeResult.isNotStarted,

          enrolledLearners,
          progressRate,
          healthStatus,
          paceGap,

          goals: sortedGoals,
          goalCompletion,

          programs: linkedPrograms,
          programAggregates,

          pathways: linkedPathways,

          templateNarrative: null, // computed below
        };

        // 11. Generate template narrative
        reportData.templateNarrative = generateTemplateNarrative(reportData);

        return reportData;
      },
    );

    // Compute portfolio summary across all funding sources
    const portfolio = computePortfolioSummary(fundingSourceReports, _learners.length);

    return {
      fundingSources: fundingSourceReports,
      portfolio,
    };
  }, [rawFundingSources, rawPrograms, rawPathways, rawGoals, isLoading, isError]);

  return { isLoading, isError, data };
}
