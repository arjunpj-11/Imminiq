export type CloneFreshnessAnalysisClaim =
  | {
      status: 'claimed';
      sourceTrackerId: string;
      sourceTrackerCreatedAt: Date;
    }
  | { status: 'not_found' }
  | { status: 'already_used' };

export interface ICloneFreshnessAnalysisRepository {
  claim(input: { trackerId: string; userId: string }): Promise<CloneFreshnessAnalysisClaim>;

  attachJob(input: { trackerId: string; userId: string; jobId: string }): Promise<void>;

  markFailed(input: { trackerId: string; userId: string }): Promise<void>;
}
