export type TrackerClanNotificationInput = {
  userId: string;
  type:
    | 'tracker_clan_join_requested'
    | 'tracker_clan_join_reviewed'
    | 'tracker_clan_role_invitation'
    | 'tracker_clan_role_invitation_response'
    | 'tracker_clan_challenge_received'
    | 'tracker_clan_challenge_accepted'
    | 'tracker_clan_challenge_declined'
    | 'tracker_clan_challenge_cancelled'
    | 'tracker_clan_challenge_completed';
  message: string;
  deepLink: string;
  eventId: string;
  metadata?: Record<string, unknown>;
};

export interface ITrackerClanNotificationNotifier {
  notify(input: TrackerClanNotificationInput): Promise<void>;
}
