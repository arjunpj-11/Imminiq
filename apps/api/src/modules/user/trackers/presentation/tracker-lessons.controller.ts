import type { NextFunction, Request, Response } from 'express';

import { ApiResponse } from '../../../../shared/utils/api-response';
import { getAuthUser } from '../../../../shared/utils/get-auth-user';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type LessonParams = { trackerId: string; subtopicId: string };
type LessonQuestionQuery = { question: string };
type MissingTopicEvaluationResult = {
  mode: 'issue' | 'suggestions' | 'none';
  message?: string;
  suggestions?: unknown[];
};

export class TrackerLessonsController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  getLesson = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getTrackerLesson.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Lesson fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonChatHistory = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getLessonChatHistory.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Lesson chat history fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  chatWithLessonTutor = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.chatWithLessonTutor.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        messages: req.body.messages,
      });

      res.json(new ApiResponse('Lesson tutor response generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonGeneratedQuestions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getLessonGeneratedQuestions.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Lesson generated questions fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  generateLessonQuestions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.generateLessonQuestions.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        count: req.body.count,
      });

      res.json(new ApiResponse('Lesson questions generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonQuestionSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery;

      const result = await this._useCases.getLessonQuestionSolution.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      });

      res.json(new ApiResponse('Lesson question solution fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  generateLessonQuestionSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.generateLessonQuestionSolution.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: req.body.question,
      });

      res.json(new ApiResponse('Lesson question solution generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery;

      const result = await this._useCases.getLessonQuestionSolutionDoubts.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      });

      res.json(new ApiResponse('Lesson question solution doubts fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  askLessonQuestionSolutionDoubt = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.askLessonQuestionSolutionDoubt.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: req.body.question,
        message: req.body.message,
      });

      res.json(new ApiResponse('Lesson question solution doubt answered successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonAnswerAttempts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getLessonAnswerAttempts.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Lesson answer attempts fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  verifyLessonAnswer = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.verifyLessonAnswer.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: req.body.question,
        answer: req.body.answer,
      });

      res.json(new ApiResponse('Answer verified successfully', result));
    } catch (error) {
      next(error);
    }
  };

  getLessonCodeSubmissions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const action =
        req.query.action === 'run' || req.query.action === 'submit' ? req.query.action : undefined;

      const result = await this._useCases.getLessonCodeSubmissions.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        action,
      });

      res.json(new ApiResponse('Lesson code submissions fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  runLessonCode = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.runLessonCode.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        languageId: req.body.languageId ?? 63,
        language: req.body.language,
        stdin: req.body.stdin,
      });

      res.json(new ApiResponse('Code executed successfully', result));
    } catch (error) {
      next(error);
    }
  };

  submitLessonCode = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.submitLessonCode.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        languageId: req.body.languageId ?? 63,
        language: req.body.language,
        stdin: req.body.stdin,
      });

      res.json(
        new ApiResponse(
          result.isCorrect ? 'Code submitted successfully' : 'Code submitted with issues',
          result
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getCodeHint = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = (await this._useCases.getCodeHint.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        actualOutput: req.body.actualOutput,
        errorOutput: req.body.errorOutput,
        hintCount: req.body.hintCount,
      })) as MissingTopicEvaluationResult;

      res.json(
        new ApiResponse(
          result.mode === 'issue'
            ? 'Code issue explained successfully'
            : 'Code hint generated successfully',
          result
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getOptimizedSolution = async (req: Request<LessonParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getOptimizedSolution.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        language: req.body.language,
      });

      res.json(new ApiResponse('Optimized solution generated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  clearLessonChatHistory = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.clearLessonChatHistory.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Lesson chat history cleared successfully', result));
    } catch (error) {
      next(error);
    }
  };

  clearLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery;

      const result = await this._useCases.clearLessonQuestionSolutionDoubts.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      });

      res.json(new ApiResponse('Lesson question solution doubts cleared successfully', result));
    } catch (error) {
      next(error);
    }
  };

  generateLessonVisualization = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.generateLessonVisualization.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        regenerate: req.query.regenerate === 'true',
      });

      res.json(new ApiResponse('Lesson visualization generated successfully', result));
    } catch (error) {
      next(error);
    }
  };
}
