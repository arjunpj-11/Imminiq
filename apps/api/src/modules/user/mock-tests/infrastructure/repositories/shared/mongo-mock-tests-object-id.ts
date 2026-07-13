import mongoose from 'mongoose';

export class MongoMockTestsObjectId {
  private constructor() {}

  static toObjectId(value: string): mongoose.Types.ObjectId | null {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return null;
    }

    return new mongoose.Types.ObjectId(value);
  }

  static toObjectIds(values: string[]): mongoose.Types.ObjectId[] {
    return values
      .filter((value) => mongoose.Types.ObjectId.isValid(value))
      .map((value) => new mongoose.Types.ObjectId(value));
  }
}
