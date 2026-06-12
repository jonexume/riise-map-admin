/**
 * TypeScript interfaces for the Funding Impact Report.
 *
 * All data is derived client-side from existing populated tables:
 * funding_sources, funding_source_goals, programs, pathways, learners.
 */

export interface ImpactReportData {
  fundingSources: FundingSourceReportData[];
  portfolio: PortfolioSummaryData;
}

export interface PortfolioSummaryData {
  totalFundingAmount: number;
  totalLearnerTarget: number;
  totalEnrolledLearners: number;
  totalLearnersInSystem: number;
  overallProgressRate: number | null;
  healthStatusCounts: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
    notStarted: number;
    noTargets: number;
    expiringSoon: number;
  };
}

export interface FundingSourceReportData {
  id: number;
  name: string;
  amount: number | null;
  startDate: string | null;
  endDate: string | null;
  learnerCount: number | null;
  objectives: string | null;
  narrative: string | null;

  // Computed timeline
  timeProgress: number | null; // 0-100, null if dates missing
  isExpired: boolean;
  isNotStarted: boolean;

  // Computed health
  enrolledLearners: number; // sum of activeLearners from linked programs
  progressRate: number | null; // enrolledLearners / learnerCount * 100
  healthStatus: HealthStatus;
  paceGap: number | null; // progressRate - timeProgress

  // Goals
  goals: GoalData[];
  goalCompletion: { completed: number; total: number; rate: number | null };

  // Programs
  programs: ProgramReportData[];
  programAggregates: ProgramAggregateData | null;

  // Pathways
  pathways: PathwayReportData[];

  // Narrative
  templateNarrative: string | null; // null if insufficient data
}

export type HealthStatus =
  | 'on_track'
  | 'at_risk'
  | 'off_track'
  | 'not_started'
  | 'no_targets'
  | 'expiring_soon';

export interface GoalData {
  id: number;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  note: string | null;
  documentFileName: string | null;
}

export interface ProgramReportData {
  id: number;
  name: string;
  activeLearners: number;
  completionRate: number;
  readinessScore: number;
  eventParticipation: number;
  placementReady: number;
  startDate: string;
  endDate: string;
}

export interface ProgramAggregateData {
  totalActiveLearners: number;
  weightedCompletionRate: number; // weighted by activeLearners
  totalEventParticipation: number;
  totalPlacementReady: number;
}

export interface PathwayReportData {
  id: number;
  name: string;
  estimatedWeeks: number;
  activeLearners: number;
  skills: string[]; // first 15 items
  milestoneCount: number;
}
