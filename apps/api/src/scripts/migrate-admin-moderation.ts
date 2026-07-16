import { connectDB, disconnectDB } from '../config/database';
import { MockTestModel } from '../infrastructure/database/models/mock-test.model';
import { MockTestQuestionIssueModel } from '../infrastructure/database/models/mock-test-question-issue.model';

const migrate = async () => {
  await connectDB();

  const backfill = await MockTestModel.updateMany(
    {
      $or: [
        { moderationStatus: { $exists: false } },
        { moderationStatus: null },
      ],
    },
    { $set: { moderationStatus: 'active' } }
  );

  await Promise.all([
    MockTestModel.createIndexes(),
    MockTestQuestionIssueModel.createIndexes(),
  ]);

  console.log(
    `Admin moderation migration complete; ${backfill.modifiedCount} legacy mock tests backfilled.`
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
