import type { NextFunction, Request, Response } from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import { trackerService, type TrackerService } from '../trackers.service'
import {
  trackerListQuerySchema,
  createTrackerSchema,
  updateTrackerSchema,
  createTopicSchema,
  createSubtopicSchema,
  updateSubtopicProgressSchema,
  lessonChatSchema,
  generateLessonQuestionsSchema,
  lessonQuestionSchema,
  askLessonQuestionSolutionDoubtSchema,
  verifyLessonAnswerSchema,
  runLessonCodeSchema,
  submitLessonCodeSchema,
  getCodeHintSchema,
  getOptimizedSolutionSchema,
  verifyTopicSchema,
  verifySubtopicSchema,
} from './trackers.schema'

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

type VerifyAnswerResult = {
  isCorrect: boolean
  feedback?: string
  explanation?: string
  expectedAnswer?: string
}

type MissingTopicEvaluationResult = {
  mode: 'issue' | 'suggestions' | 'none'
  message?: string
  suggestions?: unknown[]
}

export class TrackerController {
  constructor(private readonly service: TrackerService) {}

  readonly getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getSummary(getAuthUser(req).userId)

      res.json(
        new ApiResponse(
          'Tracker summary fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly listTrackers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = trackerListQuerySchema.parse(req.query)

      const result = await this.service.listTrackers({
        userId: getAuthUser(req).userId,
        status: query.status || 'all',
        domain: query.domain || 'all',
        sortBy: query.sortBy || 'lastActive',
        page: query.page || 1,
        limit: query.limit || 12,
      })

      res.json(
        new ApiResponse(
          'Trackers fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly createTracker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createTrackerSchema.parse(req.body)

      const result = await this.service.createTracker({
        userId: getAuthUser(req).userId,
        ...body,
      })

      res.status(201).json(
        new ApiResponse(
          'Tracker created successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getTrackerDetails = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getTrackerDetails({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly updateTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = updateTrackerSchema.parse(req.body)

      const result = await this.service.updateTracker({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        ...body,
      })

      res.json(
        new ApiResponse(
          'Tracker updated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly deleteTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.deleteTracker({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker deleted successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly archiveTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.archiveTracker({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker archived successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly restoreTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.restoreTracker({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker restored successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly publishTracker = async (
  req: Request<TrackerParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      domain,
      difficulty,
      tags,
      allowClone,
    } = req.body

    const result = await this.service.publishTracker({
      trackerId: req.params.trackerId,
      userId: getAuthUser(req).userId,
      name,
      description,
      domain,
      difficulty,
      tags,
      allowClone,
    })

    res.json(
      new ApiResponse(
        'Tracker published successfully',
        result
      )
    )
  } catch (error) {
    next(error)
  }
}

  readonly unpublishTracker = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.unpublishTracker({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker unpublished successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getRoadmap = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getRoadmap({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Tracker roadmap fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly createTopic = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createTopicSchema.parse(req.body)

      const result = await this.service.createTopic({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        title: body.title,
        description: body.description,
      })

      res.status(201).json(
        new ApiResponse(
          'Topic created successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly createSubtopic = async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createSubtopicSchema.parse(req.body)

      const result = await this.service.createSubtopic({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
        title: body.title,
        description: body.description,
        parentSubtopicId: body.parentSubtopicId,
        estimatedMinutes: body.estimatedMinutes,
      })

      res.status(201).json(
        new ApiResponse(
          'Subtopic created successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly updateSubtopicProgress = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = updateSubtopicProgressSchema.parse(req.body)

      const result = await this.service.updateSubtopicProgress({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        status: body.status,
       
      })

      res.json(
        new ApiResponse(
          'Subtopic progress updated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLesson = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getLesson({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Lesson fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLessonChatHistory = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getLessonChatHistory({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Lesson chat history fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly chatWithLessonTutor = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = lessonChatSchema.parse(req.body)

      const result = await this.service.chatWithLessonTutor({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        messages: body.messages,
      })

      res.json(
        new ApiResponse(
          'Lesson tutor response generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLessonGeneratedQuestions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getLessonGeneratedQuestions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Lesson generated questions fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly generateLessonQuestions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = generateLessonQuestionsSchema.parse(req.body)

      const result = await this.service.generateLessonQuestions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        count: body.count,
      })

      res.json(
        new ApiResponse(
          'Lesson questions generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLessonQuestionSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await this.service.getLessonQuestionSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: query.question,
      })

      res.json(
        new ApiResponse(
          'Lesson question solution fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly generateLessonQuestionSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = lessonQuestionSchema.parse(req.body)

      const result = await this.service.generateLessonQuestionSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: body.question,
      })

      res.json(
        new ApiResponse(
          'Lesson question solution generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await this.service.getLessonQuestionSolutionDoubts({
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
  readonly askLessonQuestionSolutionDoubt = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = askLessonQuestionSolutionDoubtSchema.parse(req.body)

      const result = await this.service.askLessonQuestionSolutionDoubt({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: body.question,
        message: body.message,
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
  readonly getLessonAnswerAttempts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.getLessonAnswerAttempts({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Lesson answer attempts fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly verifyLessonAnswer = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyLessonAnswerSchema.parse(req.body)

      const result = await this.service.verifyLessonAnswer({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        question: body.question,
        answer: body.answer,
      })

      res.json(
        new ApiResponse(
          'Answer verified successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly getLessonCodeSubmissions = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const action =
        req.query.action === 'run' || req.query.action === 'submit'
          ? req.query.action
          : undefined

      const result = await this.service.getLessonCodeSubmissions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        action,
      })

      res.json(
        new ApiResponse(
          'Lesson code submissions fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly runLessonCode = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = runLessonCodeSchema.parse(req.body)

      const result = await this.service.runLessonCode({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: body.sourceCode,
        languageId: body.languageId ?? 63,
        language: body.language,
        stdin: body.stdin,
      })

      res.json(
        new ApiResponse(
          'Code executed successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly submitLessonCode = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = submitLessonCodeSchema.parse(req.body)

      const result = await this.service.submitLessonCode({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: body.sourceCode,
        languageId: body.languageId ?? 63,
        language: body.language,
        stdin: body.stdin,
      })as VerifyAnswerResult

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
  readonly getCodeHint = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = getCodeHintSchema.parse(req.body)

      const result = await this.service.getCodeHint({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: body.sourceCode,
        actualOutput: body.actualOutput,
        errorOutput: body.errorOutput,
        hintCount: body.hintCount,
      }) as MissingTopicEvaluationResult

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
  readonly getOptimizedSolution = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = getOptimizedSolutionSchema.parse(req.body)

      const result = await this.service.getOptimizedSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        sourceCode: body.sourceCode,
        language: body.language,
      })

      res.json(
        new ApiResponse(
          'Optimized solution generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly clearLessonChatHistory = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.clearLessonChatHistory({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
      })

      res.json(
        new ApiResponse(
          'Lesson chat history cleared successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly clearLessonQuestionSolutionDoubts = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await this.service.clearLessonQuestionSolutionDoubts({
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
  readonly verifyTopic = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyTopicSchema.parse(req.body)

      const result = await this.service.verifyTopic({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        trackerTitle: body.trackerTitle,
        topicTitle: body.topicTitle,
        topicDescription: body.topicDescription,
        existingTopics: body.existingTopics,
      })

      res.json(
        new ApiResponse(
          'Topic verification completed',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly verifySubtopic = async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifySubtopicSchema.parse(req.body)

      const result = await this.service.verifySubtopic({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
        trackerTitle: body.trackerTitle,
        topicTitle: body.topicTitle,
        topicDescription: body.topicDescription,
        subtopicTitle: body.subtopicTitle,
        subtopicDescription: body.subtopicDescription,
        difficulty: body.difficulty,
        existingSubtopics: body.existingSubtopics,
      })

      res.json(
        new ApiResponse(
          'Subtopic verification completed',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly addMissingEvaluationTopic = async (
    req: Request<AddMissingTopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.addMissingEvaluationTopic({
        trackerId: req.params.trackerId,
        evaluationJobId: req.params.evaluationJobId,
        topicIndex: req.params.topicIndex,
        userId: getAuthUser(req).userId,
      })

      res.status(201).json(
        new ApiResponse(
          'Missing topic added to tracker',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
  readonly generateLessonVisualization = async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.service.generateLessonVisualization({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: getAuthUser(req).userId,
        regenerate: req.query.regenerate === 'true',
      })

      res.json(
        new ApiResponse(
          'Lesson visualization generated successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  }
}

export const trackerController = new TrackerController(trackerService)
