import type { NextFunction, Request, Response } from 'express'

import { HttpStatusCode } from '../../../shared/constants/http-status-code.enum'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import type { TrackerUseCases } from '../application/tracker-use-cases.contract'

type TrackerParams = {
  trackerId: string
}

type TopicParams = {
  trackerId: string
  topicId: string
}

type LessonParams = {
  trackerId: string
  subtopicId: string
}

type AddMissingTopicParams = {
  trackerId: string
  evaluationJobId: string
  topicIndex: string
}

type TrackerListQuery = Omit<
  Parameters<TrackerUseCases['listTrackers']['execute']>[0],
  'userId'
>

type LessonQuestionQuery = {
  question: string
}

type MissingTopicEvaluationResult = {
  mode: 'issue' | 'suggestions' | 'none'
  message?: string
  suggestions?: unknown[]
}

export class TrackerController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getTrackerSummary.execute(getAuthUser(req).userId)

      res.json(new ApiResponse('Tracker summary fetched successfully', result))
    } catch (error) {
      next(error)
    }
  }

  listTrackers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = res.locals.trackerListQuery as TrackerListQuery

      const result = await this._useCases.listTrackers.execute({
        userId: getAuthUser(req).userId,
        status: query.status || 'all',
        domain: query.domain || 'all',
        sortBy: query.sortBy || 'lastActive',
        page: query.page || 1,
        limit: query.limit || 12,
      })

      res.json(new ApiResponse('Trackers fetched successfully', result))
    } catch (error) {
      next(error)
    }
  }

  createTracker = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.createTracker.execute({
        userId: getAuthUser(req).userId,
        ...req.body,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Tracker created successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getTrackerDetails = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getTrackerDetails.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker fetched successfully', result))
    } catch (error) {
      next(error)
    }
  }

  updateTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.updateTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        ...req.body,
      })

      res.json(new ApiResponse('Tracker updated successfully', result))
    } catch (error) {
      next(error)
    }
  }

  deleteTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.deleteTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker deleted successfully', result))
    } catch (error) {
      next(error)
    }
  }

  archiveTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.archiveTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker archived successfully', result))
    } catch (error) {
      next(error)
    }
  }

  restoreTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.restoreTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker restored successfully', result))
    } catch (error) {
      next(error)
    }
  }

  publishTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description, domain, difficulty, tags, allowClone } =
        req.body

      const result = await this._useCases.publishTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        name,
        description,
        domain,
        difficulty,
        tags,
        allowClone,
      })

      res.json(new ApiResponse('Tracker published successfully', result))
    } catch (error) {
      next(error)
    }
  }

  unpublishTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.unpublishTracker.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker unpublished successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getRoadmap = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getTrackerRoadmap.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Tracker roadmap fetched successfully', result))
    } catch (error) {
      next(error)
    }
  }

  createTopic = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.createTrackerTopic.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        title: req.body.title,
        description: req.body.description,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Topic created successfully', result))
    } catch (error) {
      next(error)
    }
  }

  createSubtopic = async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.createTrackerSubtopic.execute({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
        title: req.body.title,
        description: req.body.description,
        parentSubtopicId: req.body.parentSubtopicId,
        estimatedMinutes: req.body.estimatedMinutes,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Subtopic created successfully', result))
    } catch (error) {
      next(error)
    }
  }

  updateSubtopicProgress = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.updateSubtopicProgress.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        status: req.body.status,
      })

      res.json(new ApiResponse('Subtopic progress updated successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getLesson = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getTrackerLesson.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(new ApiResponse('Lesson fetched successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getLessonChatHistory = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getLessonChatHistory.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse('Lesson chat history fetched successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

  chatWithLessonTutor = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.chatWithLessonTutor.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        messages: req.body.messages,
      })

      res.json(
        new ApiResponse('Lesson tutor response generated successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(
        new ApiResponse('Lesson generated questions fetched successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(new ApiResponse('Lesson questions generated successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getLessonQuestionSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery

      const result = await this._useCases.getLessonQuestionSolution.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      })

      res.json(
        new ApiResponse('Lesson question solution fetched successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(
        new ApiResponse('Lesson question solution generated successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

  getLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery

      const result = await this._useCases.getLessonQuestionSolutionDoubts.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      })

      res.json(
        new ApiResponse(
          'Lesson question solution doubts fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(
        new ApiResponse(
          'Lesson question solution doubt answered successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(
        new ApiResponse('Lesson answer attempts fetched successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

  verifyLessonAnswer = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.verifyLessonAnswer.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: req.body.question,
        answer: req.body.answer,
      })

      res.json(new ApiResponse('Answer verified successfully', result))
    } catch (error) {
      next(error)
    }
  }

  getLessonCodeSubmissions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const action =
        req.query.action === 'run' || req.query.action === 'submit'
          ? req.query.action
          : undefined

      const result = await this._useCases.getLessonCodeSubmissions.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        action,
      })

      res.json(
        new ApiResponse('Lesson code submissions fetched successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }

  runLessonCode = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.runLessonCode.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        languageId: req.body.languageId ?? 63,
        language: req.body.language,
        stdin: req.body.stdin,
      })

      res.json(new ApiResponse('Code executed successfully', result))
    } catch (error) {
      next(error)
    }
  }

  submitLessonCode = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.submitLessonCode.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        languageId: req.body.languageId ?? 63,
        language: req.body.language,
        stdin: req.body.stdin,
      })

      res.json(
        new ApiResponse(
          result.isCorrect
            ? 'Code submitted successfully'
            : 'Code submitted with issues',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }

  getCodeHint = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = (await this._useCases.getCodeHint.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        actualOutput: req.body.actualOutput,
        errorOutput: req.body.errorOutput,
        hintCount: req.body.hintCount,
      })) as MissingTopicEvaluationResult

      res.json(
        new ApiResponse(
          result.mode === 'issue'
            ? 'Code issue explained successfully'
            : 'Code hint generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }

  getOptimizedSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.getOptimizedSolution.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: req.body.sourceCode,
        language: req.body.language,
      })

      res.json(new ApiResponse('Optimized solution generated successfully', result))
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(new ApiResponse('Lesson chat history cleared successfully', result))
    } catch (error) {
      next(error)
    }
  }

  clearLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = res.locals.lessonQuestionQuery as LessonQuestionQuery

      const result = await this._useCases.clearLessonQuestionSolutionDoubts.execute({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      })

      res.json(
        new ApiResponse(
          'Lesson question solution doubts cleared successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }

  verifyTopic = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.verifyTrackerTopic.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        trackerTitle: req.body.trackerTitle,
        topicTitle: req.body.topicTitle,
        topicDescription: req.body.topicDescription,
        existingTopics: req.body.existingTopics,
      })

      res.json(new ApiResponse('Topic verification completed', result))
    } catch (error) {
      next(error)
    }
  }

  verifySubtopic = async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.verifyTrackerSubtopic.execute({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
        trackerTitle: req.body.trackerTitle,
        topicTitle: req.body.topicTitle,
        topicDescription: req.body.topicDescription,
        subtopicTitle: req.body.subtopicTitle,
        subtopicDescription: req.body.subtopicDescription,
        difficulty: req.body.difficulty,
        existingSubtopics: req.body.existingSubtopics,
      })

      res.json(new ApiResponse('Subtopic verification completed', result))
    } catch (error) {
      next(error)
    }
  }

  addMissingEvaluationTopic = async (
    req: Request<AddMissingTopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.addMissingEvaluationTopic.execute({
        trackerId: req.params.trackerId,
        evaluationJobId: req.params.evaluationJobId,
        topicIndex: req.params.topicIndex,
        userId: getAuthUser(req).userId,
      })

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Missing topic added to tracker', result))
    } catch (error) {
      next(error)
    }
  }

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
      })

      res.json(
        new ApiResponse('Lesson visualization generated successfully', result)
      )
    } catch (error) {
      next(error)
    }
  }
}
