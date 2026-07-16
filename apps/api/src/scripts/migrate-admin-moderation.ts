import { connectDB, disconnectDB } from '../config/database';
import { MockTestModel } from '../infrastructure/database/models/mock-test.model';
import { MockTestQuestionIssueModel } from '../infrastructure/database/models/mock-test-question-issue.model';
import { TrackerReport } from '../infrastructure/database/models/tracker-report.model';
import { Tracker } from '../infrastructure/database/models/tracker.model';

const migrate = async () => {
  await connectDB();

  const [mockTestBackfill, trackerBackfill] = await Promise.all([
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
  ]);

  await Promise.all([
    MockTestModel.createIndexes(),
    MockTestQuestionIssueModel.createIndexes(),
    Tracker.createIndexes(),
    TrackerReport.createIndexes(),
  ]);

  console.log(
    `Admin moderation migration complete; ${mockTestBackfill.modifiedCount} mock tests and ${trackerBackfill.modifiedCount} trackers backfilled.`
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
