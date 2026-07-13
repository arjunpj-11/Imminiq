export interface IRandomSeedGenerator {
  createSeed(upperBound: number): number;
}
