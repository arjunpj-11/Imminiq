import { connectDB, disconnectDB } from '../config/database';
import { AdaptiveAssessmentModel } from '../infrastructure/database/models/adaptive-assessment.model';

const migrate = async () => {
  await connectDB();

  await AdaptiveAssessmentModel.collection.dropIndex('attemptId_1').catch(() => undefined);
  await AdaptiveAssessmentModel.createIndexes();

  console.log('Adaptive assessment indexes migrated.');
};

void migrate()
  .catch((error) => {
    console.error('Adaptive assessment migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
