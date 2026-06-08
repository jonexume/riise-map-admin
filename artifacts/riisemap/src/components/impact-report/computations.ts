/**
 * Pure computation functions for the Funding Impact Report.
 *
 * All functions are stateless and deterministic — they take data in
 * and return derived values without side effects.
 */

import { differenceInDays, parseISO } from 'date-fns';

import type {
  FundingSourceReportData,
  GoalData,
  HealthStatus,
  PathwayReportData,
  PortfolioSummaryData,
  ProgramAggregateData,
  ProgramReportData,
} from './types';

// ---------------------------------------------------------------------------
// Input types from existing API schemas (subset of fields we need)
// ---------------------------------------------------------------------------

/** Minimal shape of a FundingSource from the API. */
export interface FundingSource {
  id: string;
  name: string;
  objectives?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  amount?: number | null;
  learnerCount?: number | null;
}

/** Minimal shape of a Program from the API. */
export interface Program {
  id: number;
  name: string;
  activeLearners: number;
  completionRate: number;
  readinessScore: number;
  eventParticipation: number;
  placementReady: number;
  funderTag: string;
  startDate: string;
  endDate: string;
}

/** Minimal shape of a Pathway from the API. */
export interface Pathway {
  id: number;
  name: string;
  estimatedWeeks: number;
  activeLearners: number;
  programCategory?: string | null;
  skills?: string[] | null;
  milestones?: string[] | null;
}

// ---------------------------------------------------------------------------
// computeProgressRate
// ---------------------------------------------------------------------------

/**
 * Computes enrollment progress rate as a percentage.
 * Returns null when learnerCount target is missing or zero.
 */
export function computeProgressRate(
  enrolledLearners: number,
  learnerCount: number | null,
): number | null {
  if (learnerCount == null || learnerCount === 0) return null;
  return Math.round((enrolledLearners / learnerCount) * 100);
}

// ---------------------------------------------------------------------------
// sortFundingSources
// ---------------------------------------------------------------------------

/**
 * Sorts funding sources by endDate ascending (nulls last),
 * then by name ascending (case-insensitive).
 */
export function sortFundingSources(sources: FundingSource[]): FundingSource[] {
  return [...sources].sort((a, b) => {
    // endDate ascending, nulls last
    const aEnd = a.endDate ?? null;
    const bEnd = b.endDate ?? null;

    if (aEnd === null && bEnd === null) {
      // Both null — fall through to name sort
    } else if (aEnd === null) {
      return 1; // a goes after b
    } else if (bEnd === null) {
      return -1; // a goes before b
    } else {
      const cmp = aEnd.localeCompare(bEnd);
      if (cmp !== 0) return cmp;
    }

    // Tie-break by name (case-insensitive)
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}

// ---------------------------------------------------------------------------
// computeTimeProgress
// ---------------------------------------------------------------------------

export interface TimeProgressResult {
  value: number | null;
  isExpired: boolean;
  isNotStarted: boolean;
}

/**
 * Computes timeline progress as a percentage 0–100.
 * Returns null value when dates are missing.
 */
export function computeTimeProgress(
  startDate: string | null,
  endDate: string | null,
  today: Date,
): TimeProgressResult {
  if (!startDate || !endDate) {
    return { value: null, isExpired: false, isNotStarted: false };
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const totalDays = differenceInDays(end, start);

  if (totalDays <= 0) {
    return { value: 100, isExpired: true, isNotStarted: false };
  }

  if (today < start) {
    return { value: 0, isExpired: false, isNotStarted: true };
  }

  if (today > end) {
    return { value: 100, isExpired: true, isNotStarted: false };
  }

  const elapsedDays = differenceInDays(today, start);
  const value = Math.round((elapsedDays / totalDays) * 100);
  return { value, isExpired: false, isNotStarted: false };
}

// ---------------------------------------------------------------------------
// computeHealthStatus
// ---------------------------------------------------------------------------

/**
 * Derives a traffic-light health classification from pace and goal data.
 */
export function computeHealthStatus(
  progressRate: number | null,
  timeProgress: number | null,
  learnerCount: number | null,
  goalCount: number,
  isNotStarted: boolean,
): HealthStatus {
  if (isNotStarted) return 'not_started';
  if (learnerCount == null && goalCount === 0) return 'no_targets';

  if (progressRate == null || timeProgress == null) {
    // Use goal-only heuristic: if goals exist but no pace data, show no_targets
    return 'no_targets';
  }

  const gap = timeProgress - progressRate;

  if (gap <= 0) return 'on_track';
  if (gap <= 20) return 'at_risk';
  return 'off_track';
}

// ---------------------------------------------------------------------------
// computeGoalCompletion
// ---------------------------------------------------------------------------

/**
 * Counts completed vs total goals and computes completion rate.
 */
export function computeGoalCompletion(goals: GoalData[]): {
  completed: number;
  total: number;
  rate: number | null;
} {
  const completed = goals.filter((g) => g.status === 'completed').length;
  const total = goals.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : null;
  return { completed, total, rate };
}

// ---------------------------------------------------------------------------
// sortGoals
// ---------------------------------------------------------------------------

const GOAL_STATUS_PRIORITY: Record<GoalData['status'], number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
};

/**
 * Stable-sorts goals by status priority:
 * in_progress → not_started → completed.
 */
export function sortGoals(goals: GoalData[]): GoalData[] {
  return [...goals].sort((a, b) => {
    return GOAL_STATUS_PRIORITY[a.status] - GOAL_STATUS_PRIORITY[b.status];
  });
}

// ---------------------------------------------------------------------------
// computeProgramAggregates
// ---------------------------------------------------------------------------

/**
 * Computes aggregate metrics across multiple programs.
 * Returns null if fewer than 2 programs (no aggregates needed).
 */
export function computeProgramAggregates(
  programs: ProgramReportData[],
): ProgramAggregateData | null {
  if (programs.length < 2) return null;

  const totalActiveLearners = programs.reduce(
    (sum, p) => sum + p.activeLearners,
    0,
  );

  const weightedCompletionRate =
    totalActiveLearners > 0
      ? Math.round(
          programs.reduce(
            (sum, p) => sum + p.completionRate * p.activeLearners,
            0,
          ) / totalActiveLearners,
        )
      : 0;

  const totalEventParticipation = programs.reduce(
    (sum, p) => sum + p.eventParticipation,
    0,
  );

  const totalPlacementReady = programs.reduce(
    (sum, p) => sum + p.placementReady,
    0,
  );

  return {
    totalActiveLearners,
    weightedCompletionRate,
    totalEventParticipation,
    totalPlacementReady,
  };
}

// ---------------------------------------------------------------------------
// filterProgramsByFunder
// ---------------------------------------------------------------------------

/**
 * Filters programs whose funderTag matches the given funding source name.
 * Maps to ProgramReportData shape.
 */
export function filterProgramsByFunder(
  programs: Program[],
  funderName: string,
): ProgramReportData[] {
  return programs
    .filter((p) => p.funderTag === funderName)
    .map((p) => ({
      id: p.id,
      name: p.name,
      activeLearners: p.activeLearners,
      completionRate: p.completionRate,
      readinessScore: p.readinessScore,
      eventParticipation: p.eventParticipation,
      placementReady: p.placementReady,
      startDate: p.startDate,
      endDate: p.endDate,
    }));
}

// ---------------------------------------------------------------------------
// filterPathwaysByPrograms
// ---------------------------------------------------------------------------

/**
 * Filters pathways whose programCategory matches any of the given program names.
 * Maps to PathwayReportData shape with skills truncated to 15 and milestone count.
 */
export function filterPathwaysByPrograms(
  pathways: Pathway[],
  programNames: string[],
): PathwayReportData[] {
  return pathways
    .filter((pw) => pw.programCategory != null && programNames.includes(pw.programCategory))
    .map((pw) => ({
      id: pw.id,
      name: pw.name,
      estimatedWeeks: pw.estimatedWeeks,
      activeLearners: pw.activeLearners,
      skills: (pw.skills || []).slice(0, 15),
      milestoneCount: (pw.milestones || []).length,
    }));
}

// ---------------------------------------------------------------------------
// generateTemplateNarrative
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic template narrative from computed report data.
 * Returns null when there's insufficient data (no programs AND no completed goals).
 * Caps output at 200 words by trimming trailing sentences.
 */
export function generateTemplateNarrative(
  data: FundingSourceReportData,
): string | null {
  if (data.programs.length === 0 && data.goalCompletion.completed === 0) {
    return null;
  }

  const sentences: string[] = [];

  // Sentence 1: Funding allocation
  if (data.amount != null && data.learnerCount != null) {
    const startDate = data.startDate ? parseISO(data.startDate) : null;
    const endDate = data.endDate ? parseISO(data.endDate) : null;
    let durationPart = '';
    if (startDate && endDate) {
      const durationMonths = Math.max(
        1,
        Math.round(differenceInDays(endDate, startDate) / 30),
      );
      durationPart = ` over ${durationMonths} months`;
    }
    sentences.push(
      `${data.name} has allocated $${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to support ${data.learnerCount} learners${durationPart}.`,
    );
  } else if (data.amount != null) {
    sentences.push(
      `${data.name} has allocated $${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    );
  } else if (data.learnerCount != null) {
    sentences.push(
      `${data.name} targets ${data.learnerCount} learners.`,
    );
  }

  // Sentence 2: Enrollment status
  if (data.programs.length > 0) {
    let enrollmentPart = `${data.enrolledLearners} learners are enrolled across ${data.programs.length} program${data.programs.length > 1 ? 's' : ''}`;
    if (data.progressRate != null) {
      enrollmentPart += `, representing a ${data.progressRate}% enrollment rate against target`;
    }
    sentences.push(`As of today, ${enrollmentPart}.`);
  }

  // Sentence 3: Goal completion
  if (data.goalCompletion.total > 0) {
    const goalRate =
      data.goalCompletion.total > 0
        ? Math.round(
            (data.goalCompletion.completed / data.goalCompletion.total) * 100,
          )
        : 0;
    sentences.push(
      `${data.goalCompletion.completed} of ${data.goalCompletion.total} funding goals are complete (${goalRate}%).`,
    );
  }

  // Sentence 4: Program metrics
  if (data.programs.length > 0) {
    const totalLearners = data.programs.reduce(
      (sum, p) => sum + p.activeLearners,
      0,
    );
    const avgCompletion =
      totalLearners > 0
        ? Math.round(
            data.programs.reduce(
              (sum, p) => sum + p.completionRate * p.activeLearners,
              0,
            ) / totalLearners,
          )
        : Math.round(
            data.programs.reduce((sum, p) => sum + p.completionRate, 0) /
              data.programs.length,
          );
    const totalPlacementReady = data.programs.reduce(
      (sum, p) => sum + p.placementReady,
      0,
    );
    sentences.push(
      `Linked programs show an average completion rate of ${avgCompletion}% with ${totalPlacementReady} learners at placement-ready status.`,
    );
  }

  if (sentences.length === 0) return null;

  // Join and enforce 200-word cap
  let narrative = sentences.join(' ');
  const words = narrative.split(/\s+/);

  if (words.length > 200) {
    // Trim to ≤200 words on sentence boundaries
    const trimmed = words.slice(0, 200).join(' ');
    // Find last sentence-ending punctuation
    const lastPeriod = trimmed.lastIndexOf('.');
    if (lastPeriod > 0) {
      narrative = trimmed.slice(0, lastPeriod + 1);
    } else {
      narrative = trimmed;
    }
  }

  return narrative;
}

// ---------------------------------------------------------------------------
// computePortfolioSummary
// ---------------------------------------------------------------------------

/**
 * Computes aggregate portfolio metrics across all funding sources.
 */
export function computePortfolioSummary(
  sources: FundingSourceReportData[],
): PortfolioSummaryData {
  const totalFundingAmount = sources.reduce(
    (sum, s) => sum + (s.amount ?? 0),
    0,
  );
  const totalLearnerTarget = sources.reduce(
    (sum, s) => sum + (s.learnerCount ?? 0),
    0,
  );
  const totalEnrolledLearners = sources.reduce(
    (sum, s) => sum + s.enrolledLearners,
    0,
  );
  const overallProgressRate =
    totalLearnerTarget > 0
      ? Math.round((totalEnrolledLearners / totalLearnerTarget) * 100)
      : null;

  const healthStatusCounts = {
    onTrack: 0,
    atRisk: 0,
    offTrack: 0,
    notStarted: 0,
    noTargets: 0,
  };

  for (const source of sources) {
    switch (source.healthStatus) {
      case 'on_track':
        healthStatusCounts.onTrack++;
        break;
      case 'at_risk':
        healthStatusCounts.atRisk++;
        break;
      case 'off_track':
        healthStatusCounts.offTrack++;
        break;
      case 'not_started':
        healthStatusCounts.notStarted++;
        break;
      case 'no_targets':
        healthStatusCounts.noTargets++;
        break;
    }
  }

  return {
    totalFundingAmount,
    totalLearnerTarget,
    totalEnrolledLearners,
    overallProgressRate,
    healthStatusCounts,
  };
}
