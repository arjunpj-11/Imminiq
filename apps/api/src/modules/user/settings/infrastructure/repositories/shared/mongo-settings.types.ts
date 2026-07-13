import type { UserSettingsData } from '../../../domain/settings.types';

export type MongoIdLike = {
  toString(): string;
};

export type MongoUserSettingsRecord = UserSettingsData & {
  _id?: MongoIdLike | string;
  userId?: MongoIdLike | string;
};

export type MongooseObjectLike<T> = {
  toObject(): T;
};

export type FlatSettingsUpdate = Record<string, unknown>;

export type UpdatableValue = boolean | number | string | string[] | undefined;

export type MongoDuplicateKeyError = {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
};
