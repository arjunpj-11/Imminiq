import type { NextFunction, Request, Response } from 'express';

import type { MockTestsUseCases } from '../application/mock-tests-use-cases.contract';
import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../../shared/utils/ApiError';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';

type ListTestsQuery = {
  page?: number;
  limit?: number;
};

export class MockTestsController {
  constructor(private readonly _useCases: MockTestsUseCases) {}

  listTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const data = await this._useCases.listMockTests.execute(
        userId,
        this.parseListTestsQuery(req)
      );

      res.json(new ApiResponse('Tests fetched', data));
    } catch (error) {
      next(error);
    }
  };

  createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.createMockTest.execute(getAuthUser(req).userId, req.body);

      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Test created', data));
    } catch (error) {
      next(error);
    }
  };

  generateTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      if (req.body.runInBackground) {
        const data = await this._useCases.startMockTestGeneration.execute(userId, req.body);
        res
          .status(HttpStatusCode.ACCEPTED)
          .json(new ApiResponse('Mock test generation started', data));
        return;
      }
      const data = await this._useCases.generateMockTest.execute(userId, req.body);

      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Test generated', data));
    } catch (error) {
      next(error);
    }
  };

  getActiveGeneration = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getActiveMockTestGeneration.execute(
        getAuthUser(req).userId
      );
      res.json(new ApiResponse('Active mock-test generation fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getGenerationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getMockTestGenerationStatus.execute(
        getAuthUser(req).userId,
        this.getParam(req.params.jobId, 'jobId')
      );
      res.json(new ApiResponse('Mock-test generation status fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getMockTestDetails.execute(
        this.getParam(req.params.testId, 'testId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Test fetched', data));
    } catch (error) {
      next(error);
    }
  };

  startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.startTestAttempt.execute(
        this.getParam(req.params.testId, 'testId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Test started', data));
    } catch (error) {
      next(error);
    }
  };

  getAttemptQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAttemptQuestions.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Questions fetched', data));
    } catch (error) {
      next(error);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.submitAnswer.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        req.body
      );

      res.json(new ApiResponse('Answer submitted', data));
    } catch (error) {
      next(error);
    }
  };

  flagQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.flagQuestion.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        req.body.questionId
      );

      res.json(new ApiResponse('Question flag toggled', data));
    } catch (error) {
      next(error);
    }
  };

  reportQuestionIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.reportQuestionIssue.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        this.getParam(req.params.questionId, 'questionId'),
        getAuthUser(req).userId,
        req.body
      );

      res.status(201).json(new ApiResponse('Question report submitted', data));
    } catch (error) {
      next(error);
    }
  };

  finishAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.finishTestAttempt.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Test finished', data));
    } catch (error) {
      next(error);
    }
  };

  getAttemptResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAttemptResult.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Result fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getAttemptAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAttemptAnalysis.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Analysis fetched', data));
    } catch (error) {
      next(error);
    }
  };

  retakeTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.retakeTest.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId
      );

      res.json(new ApiResponse('Retake started', data));
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getHistory.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('History fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAnalytics.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Analytics fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getAIInsights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getAIInsights.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('AI insights fetched', data));
    } catch (error) {
      next(error);
    }
  };

  getTopicBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.getTopicBreakdown.execute(getAuthUser(req).userId);

      res.json(new ApiResponse('Topic breakdown fetched', data));
    } catch (error) {
      next(error);
    }
  };

  shareTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;

      const data = await this._useCases.shareMockTest.execute({
        userId: getAuthUser(req).userId,
        testId: this.getParam(req.params.testId, 'testId'),
        origin,
      });

      res.json(new ApiResponse('Share link created', data));
    } catch (error) {
      next(error);
    }
  };

  importSharedTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.importSharedMockTest.execute({
        userId: getAuthUser(req).userId,
        shareToken: this.getParam(req.params.shareToken, 'shareToken'),
      });

      res.status(HttpStatusCode.CREATED).json(new ApiResponse('Shared test imported', data));
    } catch (error) {
      next(error);
    }
  };

  runCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.runMockTestCode.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        this.getParam(req.params.questionId, 'questionId'),
        req.body
      );

      res.json(new ApiResponse('Code executed', data));
    } catch (error) {
      next(error);
    }
  };

  submitCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.submitMockTestCode.execute(
        this.getParam(req.params.attemptId, 'attemptId'),
        getAuthUser(req).userId,
        this.getParam(req.params.questionId, 'questionId'),
        req.body
      );

      res.json(new ApiResponse('Code submitted', data));
    } catch (error) {
      next(error);
    }
  };

  private getParam(value: string | string[] | undefined, name: string): string {
    const resolved = Array.isArray(value) ? value[0] : value;

    if (!resolved) {
      throw new ApiError(HttpStatusCode.BAD_REQUEST, `${name} is required`, 'VALIDATION_ERROR');
    }

    return resolved;
  }

  private parseStringQuery(value: unknown): string | undefined {
    if (Array.isArray(value)) {
      return typeof value[0] === 'string' ? value[0] : undefined;
    }

    return typeof value === 'string' ? value : undefined;
  }

  private parseNumberQuery(value: unknown): number | undefined {
    const raw = this.parseStringQuery(value);

    if (!raw) {
      return undefined;
    }

    const parsed = Number(raw);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseListTestsQuery(req: Request): ListTestsQuery {
    return {
      page: this.parseNumberQuery(req.query.page),
      limit: this.parseNumberQuery(req.query.limit),
    };
  }
}
