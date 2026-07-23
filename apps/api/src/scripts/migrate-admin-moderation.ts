import { connectDB, disconnectDB } from '../config/database';
import { MockTestModel } from '../infrastructure/database/models/mock-test.model';
import { MockTestQuestionIssueModel } from '../infrastructure/database/models/mock-test-question-issue.model';
import { TrackerReport } from '../infrastructure/database/models/tracker-report.model';
import { Tracker } from '../infrastructure/database/models/tracker.model';
import { TrackerVersion } from '../infrastructure/database/models/tracker-version.model';
import { MockTestQuestionVersionModel } from '../infrastructure/database/models/mock-test-question-version.model';
import { ContentModerationAppeal } from '../infrastructure/database/models/content-moderation-appeal.model';
import { DataPrivacyRequest } from '../infrastructure/database/models/data-privacy-request.model';
import { AdminUserNote } from '../infrastructure/database/models/admin-user-note.model';
import { MockTestAttemptModel } from '../infrastructure/database/models/mock-test-attempt.model';
import { CommunityVerificationSubmission } from '../infrastructure/database/models/community-verification-submission.model';
import { User } from '../infrastructure/database/models/user.model';
import { MockTestCreationSessionModel } from '../infrastructure/database/models/mock-test-creation-session.model';
import { UserSettings } from '../infrastructure/database/models/user-settings.model';
import { AdminConsoleSettings } from '../infrastructure/database/models/admin-console-settings.model';
import { Notification } from '../infrastructure/database/models/notification.model';

const migrate = async () => {
  await connectDB();

  const [mockTestBackfill, trackerBackfill, trackerVersionBackfill, userTagBackfill, voteBackfill] =
    await Promise.all([
      MockTestModel.updateMany(
        {
          $or: [{ moderationStatus: { $exists: false } }, { moderationStatus: null }],
        },
        { $set: { moderationStatus: 'active' } }
      ),
      Tracker.updateMany(
        {
          $or: [{ moderationStatus: { $exists: false } }, { moderationStatus: null }],
        },
        { $set: { moderationStatus: 'active' } }
      ),
      Tracker.updateMany(
        { $or: [{ version: { $exists: false } }, { version: null }] },
        { $set: { version: 1 } }
      ),
      User.updateMany({ adminTags: { $exists: false } }, { $set: { adminTags: [] } }),
      CommunityVerificationSubmission.updateMany(
        { adminVotes: { $exists: false } },
        { $set: { adminVotes: [] } }
      ),
    ]);

  await Promise.all([
    MockTestModel.updateMany({}, { $unset: { visibility: '' } }),
    MockTestCreationSessionModel.updateMany({}, { $unset: { 'draftData.visibility': '' } }),
    User.updateMany({}, { $unset: { verificationExpiresAt: '' } }),
    AdminConsoleSettings.updateMany({}, { $unset: { supportEmail: '', auditRetentionDays: '' } }),
    UserSettings.updateMany(
      {},
      {
        $unset: {
          account: '',
          email: '',
          push: '',
          editor: '',
          compiler: '',
          aiBehaviour: '',
          learningJourney: '',
          gestures: '',
          cookieConsent: '',
          termsAcceptedAt: '',
          'notifications.emailDigest': '',
          'notifications.quietHours': '',
          'notifications.marketing': '',
          'privacy.profileVisibility': '',
          'privacy.allowMessages': '',
        },
      }
    ),
  ]);

  await Promise.all([
    User.collection.dropIndex('verificationExpiresAt_1').catch(() => undefined),
    MockTestModel.collection
      .dropIndex('visibility_1_difficulty_1_createdAt_-1')
      .catch(() => undefined),
  ]);

  await Promise.all([
    MockTestModel.createIndexes(),
    MockTestQuestionIssueModel.createIndexes(),
    Tracker.createIndexes(),
    TrackerReport.createIndexes(),
    TrackerVersion.createIndexes(),
    MockTestQuestionVersionModel.createIndexes(),
    ContentModerationAppeal.createIndexes(),
    DataPrivacyRequest.createIndexes(),
    AdminUserNote.createIndexes(),
    MockTestAttemptModel.createIndexes(),
    CommunityVerificationSubmission.createIndexes(),
    User.createIndexes(),
    MockTestCreationSessionModel.createIndexes(),
    UserSettings.createIndexes(),
    AdminConsoleSettings.createIndexes(),
    Notification.createIndexes(),
  ]);

  console.log(
    `Admin moderation migration complete; ${mockTestBackfill.modifiedCount} mock tests, ${trackerBackfill.modifiedCount} tracker moderation states, ${trackerVersionBackfill.modifiedCount} tracker versions, ${userTagBackfill.modifiedCount} user tag arrays, and ${voteBackfill.modifiedCount} review vote arrays backfilled.`
  );
};

void migrate()
  .catch((error) => {
    console.error('Admin moderation migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
