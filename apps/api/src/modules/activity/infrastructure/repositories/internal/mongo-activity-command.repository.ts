import mongoose from 'mongoose'

import { UserActivity } from '../../../../../infrastructure/database/models/user-activity.model'
import { User } from '../../../../../infrastructure/database/models/user.model'
import { ActivityDomainError } from '../../../domain/errors/activity-domain.error'
import type {
  ActivityCommandRepositoryContract,
  RecordUserActivityInput,
  RecordUserActivityResult,
} from '../../../domain/repositories/activity-command.repository.interface'
import type { ActivityProgressionChange } from '../../../domain/types/activity.types'
import { MongoActivityBaseRepository } from '../shared/mongo-activity-base.repository'
import { MongoActivityErrorMapper } from '../shared/mongo-activity-error.mapper'
import { MongoActivityMapper } from '../shared/mongo-activity.mapper'
import type { MongoUserActivityRecord } from '../shared/mongo-activity.types'

export class MongoActivityCommandRepository
  extends MongoActivityBaseRepository
  implements ActivityCommandRepositoryContract
{
  constructor(
    private readonly _mapper = new MongoActivityMapper(),
  ) {
    super()
  }

  async recordActivityAndApplyReward(
    input: RecordUserActivityInput,
  ): Promise<RecordUserActivityResult> {
    return this.execute(
      'ACTIVITY_WRITE_FAILED',
      'Failed to record user activity',
      async () => {
        const userId = this.toObjectId(input.userId)
        const session = await mongoose.startSession()

        try {
          let result:
            | RecordUserActivityResult
            | undefined

          await session.withTransaction(async () => {
            const existing =
              await UserActivity.findOne({
                userId,
                eventKey: input.eventKey,
              })
                .session(session)
                .lean<MongoUserActivityRecord>()

            if (existing) {
              this.ensureSameEvent(existing, input)

              result = {
                activity:
                  this._mapper.toEntityOrThrow(existing),
                created: false,
              }

              return
            }

            const user = await User.findOne({
              _id: userId,
              status: 'active',
              deletedAt: null,
            }).session(session)

            if (!user) {
              throw new ActivityDomainError(
                'ACTIVITY_USER_NOT_FOUND',
                'Activity user not found',
              )
            }

            const progressionBefore = {
              learningXp: Math.max(0, user.xp ?? 0),
              learningLevel: Math.max(
                1,
                user.level ?? 1,
              ),
              teacherXp: Math.max(
                0,
                user.teacherXp ?? 0,
              ),
              teacherLevel: Math.max(
                1,
                user.teacherLevel ?? 1,
              ),
              coins: Math.max(0, user.coins ?? 0),
            }

            if (input.xpBucket === 'learning') {
              user.xp =
                progressionBefore.learningXp +
                input.xpAwarded
            }

            if (input.xpBucket === 'teacher') {
              user.teacherXp =
                progressionBefore.teacherXp +
                input.xpAwarded
            }

            if (input.coinsAwarded > 0) {
              user.coins =
                progressionBefore.coins +
                input.coinsAwarded
            }

            if (
              input.xpAwarded > 0 ||
              input.coinsAwarded > 0
            ) {
              /*
               * User.save() intentionally runs the User model's
               * progression middleware so level and teacherLevel
               * stay synchronized with XP.
               */
              await user.save({ session })
            }

            const [createdDocument] =
              await UserActivity.create(
                [
                  {
                    userId,

                    category: input.category,
                    type: input.type,

                    title: input.title,
                    subtitle: input.subtitle,

                    xpAwarded: input.xpAwarded,
                    xpBucket: input.xpBucket,
                    coinsAwarded:
                      input.coinsAwarded,

                    eventKey: input.eventKey,

                    trackerId:
                      this.toNullableObjectId(
                        input.trackerId,
                      ),

                    topicId:
                      this.toNullableObjectId(
                        input.topicId,
                      ),

                    subtopicId:
                      this.toNullableObjectId(
                        input.subtopicId,
                      ),

                    mockTestId:
                      this.toNullableObjectId(
                        input.mockTestId,
                      ),

                    attemptId:
                      this.toNullableObjectId(
                        input.attemptId,
                      ),

                    sourceUserId:
                      this.toNullableObjectId(
                        input.sourceUserId,
                      ),

                    details: input.details,
                    occurredAt: input.occurredAt,
                    deletedAt: null,
                  },
                ],
                {
                  session,
                },
              )

            if (!createdDocument) {
              throw new ActivityDomainError(
                'ACTIVITY_CREATE_FAILED',
                'Failed to create user activity',
              )
            }

            const activity =
              this._mapper.toEntityOrThrow(
                this._mapper.toPlainRecord<
                  MongoUserActivityRecord
                >(createdDocument),
              )

            const progression:
              ActivityProgressionChange = {
              previousLearningXp:
                progressionBefore.learningXp,
              currentLearningXp:
                Math.max(0, user.xp ?? 0),

              previousLearningLevel:
                progressionBefore.learningLevel,
              currentLearningLevel:
                Math.max(1, user.level ?? 1),

              previousTeacherXp:
                progressionBefore.teacherXp,
              currentTeacherXp:
                Math.max(0, user.teacherXp ?? 0),

              previousTeacherLevel:
                progressionBefore.teacherLevel,
              currentTeacherLevel:
                Math.max(
                  1,
                  user.teacherLevel ?? 1,
                ),

              previousCoins:
                progressionBefore.coins,
              currentCoins:
                Math.max(0, user.coins ?? 0),
            }

            result = {
              activity,
              created: true,
              progression,
            }
          })

          if (!result) {
            throw new ActivityDomainError(
              'ACTIVITY_TRANSACTION_FAILED',
              'Activity transaction did not produce a result',
            )
          }

          return result
        } catch (error) {
          if (
            !MongoActivityErrorMapper.isDuplicateKeyError(
              error,
            )
          ) {
            throw error
          }

          /*
           * A concurrent request may win the unique event-key
           * insert. Its transaction succeeds and this transaction
           * is rolled back, including its User XP/coin changes.
           */
          const existing =
            await UserActivity.findOne({
              userId,
              eventKey: input.eventKey,
            }).lean<MongoUserActivityRecord>()

          if (!existing) {
            throw error
          }

          this.ensureSameEvent(existing, input)

          return {
            activity:
              this._mapper.toEntityOrThrow(existing),
            created: false,
          }
        } finally {
          await session.endSession()
        }
      },
    )
  }

  private ensureSameEvent(
    existing: MongoUserActivityRecord,
    input: RecordUserActivityInput,
  ): void {
    const isSame =
      existing.userId.toString() === input.userId &&
      existing.category === input.category &&
      existing.type === input.type &&
      (existing.xpAwarded ?? 0) ===
        input.xpAwarded &&
      (existing.xpBucket ?? 'none') ===
        input.xpBucket &&
      (existing.coinsAwarded ?? 0) ===
        input.coinsAwarded &&
      this.sameOptionalId(
        existing.trackerId,
        input.trackerId,
      ) &&
      this.sameOptionalId(
        existing.topicId,
        input.topicId,
      ) &&
      this.sameOptionalId(
        existing.subtopicId,
        input.subtopicId,
      ) &&
      this.sameOptionalId(
        existing.mockTestId,
        input.mockTestId,
      ) &&
      this.sameOptionalId(
        existing.attemptId,
        input.attemptId,
      ) &&
      this.sameOptionalId(
        existing.sourceUserId,
        input.sourceUserId,
      )

    if (!isSame) {
      throw new ActivityDomainError(
        'ACTIVITY_EVENT_CONFLICT',
        'The activity event key is already used by a different event',
      )
    }
  }

  private sameOptionalId(
    existing:
      | {
          toString(): string
        }
      | null
      | undefined,
    incoming?: string,
  ): boolean {
    return (
      (existing?.toString() ?? undefined) ===
      incoming
    )
  }

  private toNullableObjectId(
    value?: string,
  ): mongoose.Types.ObjectId | null {
    if (value === undefined) {
      return null
    }

    return this.toObjectId(value)
  }

  private toObjectId(
    value: string,
  ): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ActivityDomainError(
        'INVALID_ACTIVITY_OBJECT_ID',
        'Activity object ID is invalid',
      )
    }

    return new mongoose.Types.ObjectId(value)
  }
}
