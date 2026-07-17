import type * as Application from './index';
export type TrackerCreationUseCases = {
  continueTrackerIntake: Application.IContinueTrackerIntakeUseCase;
  saveTrackerCreationStepOne: Application.ISaveTrackerCreationStepOneUseCase;
  saveTrackerCreationStepTwo: Application.ISaveTrackerCreationStepTwoUseCase;
  generateRoadmap: Application.IGenerateRoadmapUseCase;
  getActiveRoadmapJob: Application.IGetActiveRoadmapJobUseCase;
  getRoadmapJobStatus: Application.IGetRoadmapJobStatusUseCase;
  getRoadmapJobResult: Application.IGetRoadmapJobResultUseCase;
  evaluateRoadmap: Application.IEvaluateRoadmapUseCase;
  analyzeClonedTracker: Application.IAnalyzeClonedTrackerUseCase;
  getRoadmapEvaluationResult: Application.IGetRoadmapEvaluationResultUseCase;
};
