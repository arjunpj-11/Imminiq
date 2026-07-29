import { Types } from 'mongoose';

import { connectDB, disconnectDB } from '../config/database';
import { LessonVisualization } from '../infrastructure/database/models/lesson-visualization.model';
import { Tracker } from '../infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../infrastructure/database/models/tracker-subtopic.model';

type VisualizationRow = {
  _id: Types.ObjectId;
  trackerId: Types.ObjectId;
  subtopicId: Types.ObjectId;
  updatedAt?: Date;
};

const migrate = async () => {
  await connectDB();

  const rows = await LessonVisualization.find({ deletedAt: null })
    .select('_id trackerId subtopicId updatedAt')
    .sort({ updatedAt: -1 })
    .lean<VisualizationRow[]>();

  const trackerIds = [...new Set(rows.map((row) => row.trackerId.toHexString()))].map(
    (id) => new Types.ObjectId(id)
  );
  const subtopicIds = [...new Set(rows.map((row) => row.subtopicId.toHexString()))].map(
    (id) => new Types.ObjectId(id)
  );

  const [trackers, subtopics] = await Promise.all([
    Tracker.find({ _id: { $in: trackerIds } })
      .select('_id sourceTrackerId')
      .lean<Array<{ _id: Types.ObjectId; sourceTrackerId?: Types.ObjectId | null }>>(),
    TrackerSubtopic.find({ _id: { $in: subtopicIds } })
      .select('_id sourceSubtopicId')
      .lean<Array<{ _id: Types.ObjectId; sourceSubtopicId?: Types.ObjectId | null }>>(),
  ]);

  const trackerMap = new Map(
    trackers.map((tracker) => [tracker._id.toHexString(), tracker.sourceTrackerId ?? tracker._id])
  );
  const subtopicMap = new Map(
    subtopics.map((subtopic) => [
      subtopic._id.toHexString(),
      subtopic.sourceSubtopicId ?? subtopic._id,
    ])
  );
  const groups = new Map<
    string,
    { trackerId: Types.ObjectId; subtopicId: Types.ObjectId; rows: VisualizationRow[] }
  >();

  for (const row of rows) {
    const trackerId = trackerMap.get(row.trackerId.toHexString()) ?? row.trackerId;
    const subtopicId = subtopicMap.get(row.subtopicId.toHexString()) ?? row.subtopicId;
    const contentKey = `${trackerId.toHexString()}:${subtopicId.toHexString()}`;
    const group = groups.get(contentKey);

    if (group) {
      group.rows.push(row);
    } else {
      groups.set(contentKey, { trackerId, subtopicId, rows: [row] });
    }
  }

  await LessonVisualization.collection
    .dropIndex('trackerId_1_subtopicId_1_userId_1')
    .catch(() => undefined);
  await LessonVisualization.updateMany(
    { deletedAt: { $ne: null } },
    { $unset: { contentKey: '' } }
  );

  const duplicateIds = [...groups.values()].flatMap((group) =>
    group.rows.slice(1).map((row) => row._id)
  );
  if (duplicateIds.length > 0) {
    await LessonVisualization.deleteMany({ _id: { $in: duplicateIds } });
  }

  if (groups.size > 0) {
    await LessonVisualization.bulkWrite(
      [...groups.entries()].map(([contentKey, group]) => ({
        updateOne: {
          filter: { _id: group.rows[0]!._id },
          update: {
            $set: {
              contentKey,
              trackerId: group.trackerId,
              subtopicId: group.subtopicId,
            },
          },
        },
      }))
    );
  }

  await LessonVisualization.createIndexes();

  console.log(
    `Shared lesson visualizations migrated: ${groups.size} kept, ${duplicateIds.length} duplicates removed.`
  );
};

void migrate()
  .catch((error) => {
    console.error('Shared lesson visualization migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
