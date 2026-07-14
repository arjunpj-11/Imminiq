export type MongoIdLike = {
  toString(): string;
};

export type MaybeMongooseDocument<T> = T & {
  toObject?: () => T;
};

export type MongoOnboardingResponseRecord = {
  _id?: MongoIdLike | string;
  userId?: MongoIdLike | string;
  isCompleted?: boolean;
  preparingFor?: string;
  goal?: string;
  currentLevel?: string;
  completedStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

export type MongoAIGenerationJobRecord = {
  _id: MongoIdLike | string;
  userId: MongoIdLike | string;
  jobType: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  outputData?: Record<string, unknown>;
  errorMessage?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type MongoAIGenerationStepRecord = {
  _id?: MongoIdLike | string;
  jobId?: MongoIdLike | string;
  stepNumber: number;
  stepLabel: string;
  status: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
};

export type MongoRoadmapTopicRecord = {
  _id: MongoIdLike | string;
  title: string;
  description: string;
  order: number;
};

export type MongoRoadmapSubtopicRecord = {
  _id: MongoIdLike | string;
  topicId: MongoIdLike | string;
  parentSubtopicId?: MongoIdLike | string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
};

export type MongoTrackerRecord = {
  _id?: MongoIdLike | string;
  [key: string]: unknown;
};

export type MongoDuplicateKeyError = {
  code?: number;
};
