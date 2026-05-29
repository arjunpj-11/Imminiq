import {
  Request,
  Response,
  NextFunction,
} from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { trackerService } from '../trackers.service'

import {
  askLessonQuestionSolutionDoubtSchema,
  createSubtopicSchema,
  createTopicSchema,
  createTrackerSchema,
  generateLessonQuestionsSchema,
  getCodeHintSchema,
  getOptimizedSolutionSchema,
  lessonChatSchema,
  lessonQuestionSchema,
  runLessonCodeSchema,
  submitLessonCodeSchema,
  trackerListQuerySchema,
  updateSubtopicProgressSchema,
  updateTrackerSchema,
  verifyLessonAnswerSchema,
  verifySubtopicSchema,
  verifyTopicSchema,
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

export const trackerController = {
  getSummary: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getSummary(req.user!.userId)

      res.json(
        new ApiResponse(
          'Tracker summary fetched successfully',
          result
        )
      )
    } catch (error) {
      next(error)
    }
  },

  listTrackers: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = trackerListQuerySchema.parse(req.query)

      const result = await trackerService.listTrackers({
        userId: req.user!.userId,
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
  },

  createTracker: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createTrackerSchema.parse(req.body)

      const result = await trackerService.createTracker({
        userId: req.user!.userId,
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
  },

  getTrackerDetails: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getTrackerDetails({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  updateTracker: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = updateTrackerSchema.parse(req.body)

      const result = await trackerService.updateTracker({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  deleteTracker: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.deleteTracker({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  archiveTracker: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.archiveTracker({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  restoreTracker: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.restoreTracker({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

 publishTracker: async (
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

    const result = await trackerService.publishTracker({
      trackerId: req.params.trackerId,
      userId: req.user!.userId,
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
},

  unpublishTracker: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.unpublishTracker({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  getRoadmap: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getRoadmap({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  createTopic: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createTopicSchema.parse(req.body)

      const result = await trackerService.createTopic({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  createSubtopic: async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = createSubtopicSchema.parse(req.body)

      const result = await trackerService.createSubtopic({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: req.user!.userId,
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
  },

  updateSubtopicProgress: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = updateSubtopicProgressSchema.parse(req.body)

      const result = await trackerService.updateSubtopicProgress({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLesson: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getLesson({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonChatHistory: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getLessonChatHistory({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  chatWithLessonTutor: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = lessonChatSchema.parse(req.body)

      const result = await trackerService.chatWithLessonTutor({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonGeneratedQuestions: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getLessonGeneratedQuestions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  generateLessonQuestions: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = generateLessonQuestionsSchema.parse(req.body)

      const result = await trackerService.generateLessonQuestions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonQuestionSolution: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await trackerService.getLessonQuestionSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  generateLessonQuestionSolution: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = lessonQuestionSchema.parse(req.body)

      const result = await trackerService.generateLessonQuestionSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonQuestionSolutionDoubts: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await trackerService.getLessonQuestionSolutionDoubts({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  askLessonQuestionSolutionDoubt: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = askLessonQuestionSolutionDoubtSchema.parse(req.body)

      const result = await trackerService.askLessonQuestionSolutionDoubt({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonAnswerAttempts: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.getLessonAnswerAttempts({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  verifyLessonAnswer: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyLessonAnswerSchema.parse(req.body)

      const result = await trackerService.verifyLessonAnswer({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  getLessonCodeSubmissions: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const action =
        req.query.action === 'run' || req.query.action === 'submit'
          ? req.query.action
          : undefined

      const result = await trackerService.getLessonCodeSubmissions({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  runLessonCode: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = runLessonCodeSchema.parse(req.body)

      const result = await trackerService.runLessonCode({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  submitLessonCode: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = submitLessonCodeSchema.parse(req.body)

      const result = await trackerService.submitLessonCode({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
        sourceCode: body.sourceCode,
        languageId: body.languageId ?? 63,
        language: body.language,
        stdin: body.stdin,
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
  },

  getCodeHint: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = getCodeHintSchema.parse(req.body)

      const result = await trackerService.getCodeHint({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
        sourceCode: body.sourceCode,
        actualOutput: body.actualOutput,
        errorOutput: body.errorOutput,
        hintCount: body.hintCount,
      })

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
  },

  getOptimizedSolution: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = getOptimizedSolutionSchema.parse(req.body)

      const result = await trackerService.getOptimizedSolution({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  clearLessonChatHistory: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.clearLessonChatHistory({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  clearLessonQuestionSolutionDoubts: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const query = lessonQuestionSchema.parse(req.query)

      const result = await trackerService.clearLessonQuestionSolutionDoubts({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },

  verifyTopic: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyTopicSchema.parse(req.body)

      const result = await trackerService.verifyTopic({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
  },

  verifySubtopic: async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifySubtopicSchema.parse(req.body)

      const result = await trackerService.verifySubtopic({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: req.user!.userId,
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
  },

  addMissingEvaluationTopic: async (
    req: Request<AddMissingTopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.addMissingEvaluationTopic({
        trackerId: req.params.trackerId,
        evaluationJobId: req.params.evaluationJobId,
        topicIndex: req.params.topicIndex,
        userId: req.user!.userId,
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
  },

  generateLessonVisualization: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await trackerService.generateLessonVisualization({
        trackerId: req.params.trackerId,
        subtopicId: req.params.subtopicId,
        userId: req.user!.userId,
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
  },
}
