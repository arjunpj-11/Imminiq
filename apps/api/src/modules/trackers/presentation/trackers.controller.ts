// apps/api/src/modules/trackers/presentation/trackers.controller.ts

import {
  Request,
  Response,
  NextFunction,
} from 'express'

import { ApiResponse } from '../../../shared/utils/ApiResponse'

import { mongoTrackerRepository } from '../infrastructure/repositories/mongo-tracker.repository'

import { GetTrackerSummaryUseCase } from '../application/use-cases/get-tracker-summary.usecase'
import { ListTrackersUseCase } from '../application/use-cases/list-trackers.usecase'
import { CreateTrackerUseCase } from '../application/use-cases/create-tracker.usecase'
import { GetTrackerDetailsUseCase } from '../application/use-cases/get-tracker-details.usecase'
import { UpdateTrackerUseCase } from '../application/use-cases/update-tracker.usecase'
import { DeleteTrackerUseCase } from '../application/use-cases/delete-tracker.usecase'
import { ArchiveTrackerUseCase } from '../application/use-cases/archive-tracker.usecase'
import { RestoreTrackerUseCase } from '../application/use-cases/restore-tracker.usecase'
import { PublishTrackerUseCase } from '../application/use-cases/publish-tracker.usecase'
import { UnpublishTrackerUseCase } from '../application/use-cases/unpublish-tracker.usecase'
import { GetTrackerRoadmapUseCase } from '../application/use-cases/get-tracker-roadmap.usecase'
import { CreateTrackerTopicUseCase } from '../application/use-cases/create-tracker-topic.usecase'
import { CreateTrackerSubtopicUseCase } from '../application/use-cases/create-tracker-subtopic.usecase'
import { UpdateSubtopicProgressUseCase } from '../application/use-cases/update-subtopic-progress.usecase'
import { GetTrackerLessonUseCase } from '../application/use-cases/get-tracker-lesson.usecase'
import { ChatWithLessonTutorUseCase } from '../application/use-cases/chat-with-lesson-tutor.usecase'
import { RunLessonCodeUseCase } from '../application/use-cases/run-lesson-code.usecase'
import { AddMissingEvaluationTopicUseCase } from '../application/use-cases/add-missing-evaluation-topic.usecase'

import { SubmitLessonCodeUseCase } from '../application/use-cases/submit-lesson-code.usecase'
import { GetCodeHintUseCase } from '../application/use-cases/get-code-hint.usecase'
import { GetOptimizedSolutionUseCase } from '../application/use-cases/get-optimized-solution.usecase'
import { VerifyTrackerTopicUseCase } from '../application/use-cases/verify-tracker-topic.usecase'
import { VerifyTrackerSubtopicUseCase } from '../application/use-cases/verify-tracker-subtopic.usecase'
import { VerifyLessonAnswerUseCase } from '../application/use-cases/verify-lesson-answer.usecase'

import { GetLessonGeneratedQuestionsUseCase } from '../application/use-cases/get-lesson-generated-questions.usecase'
import { GenerateLessonQuestionsUseCase } from '../application/use-cases/generate-lesson-questions.usecase'
import { GetLessonQuestionSolutionUseCase } from '../application/use-cases/get-lesson-question-solution.usecase'
import { GenerateLessonQuestionSolutionUseCase } from '../application/use-cases/generate-lesson-question-solution.usecase'
import { GetLessonQuestionSolutionDoubtsUseCase } from '../application/use-cases/get-lesson-question-solution-doubts.usecase'
import { AskLessonQuestionSolutionDoubtUseCase } from '../application/use-cases/ask-lesson-question-solution-doubt.usecase'
import { ClearLessonChatHistoryUseCase } from '../application/use-cases/clear-lesson-chat-history.usecase'
import { ClearLessonQuestionSolutionDoubtsUseCase } from '../application/use-cases/clear-lesson-question-solution-doubts.usecase'
import { GenerateLessonVisualizationUseCase } from '../application/use-cases/generate-lesson-visualization.usecase'

import {
  createSubtopicSchema,
  createTopicSchema,
  createTrackerSchema,
  lessonChatSchema,
  runLessonCodeSchema,
  submitLessonCodeSchema,
  getCodeHintSchema,
  getOptimizedSolutionSchema,
  verifyLessonAnswerSchema,
  trackerListQuerySchema,
  updateSubtopicProgressSchema,
  updateTrackerSchema,
  verifyTopicSchema,
  verifySubtopicSchema,
   generateLessonQuestionsSchema,
  lessonQuestionSchema,
  askLessonQuestionSolutionDoubtSchema,
} from './trackers.validation'

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

const getTrackerSummaryUseCase =
  new GetTrackerSummaryUseCase(mongoTrackerRepository)

const listTrackersUseCase =
  new ListTrackersUseCase(mongoTrackerRepository)

const createTrackerUseCase =
  new CreateTrackerUseCase(mongoTrackerRepository)

const getTrackerDetailsUseCase =
  new GetTrackerDetailsUseCase(mongoTrackerRepository)

const updateTrackerUseCase =
  new UpdateTrackerUseCase(mongoTrackerRepository)

const deleteTrackerUseCase =
  new DeleteTrackerUseCase(mongoTrackerRepository)

const archiveTrackerUseCase =
  new ArchiveTrackerUseCase(mongoTrackerRepository)

const restoreTrackerUseCase =
  new RestoreTrackerUseCase(mongoTrackerRepository)

const publishTrackerUseCase =
  new PublishTrackerUseCase(mongoTrackerRepository)

const unpublishTrackerUseCase =
  new UnpublishTrackerUseCase(mongoTrackerRepository)

const getTrackerRoadmapUseCase =
  new GetTrackerRoadmapUseCase(mongoTrackerRepository)

const createTrackerTopicUseCase =
  new CreateTrackerTopicUseCase(mongoTrackerRepository)

const createTrackerSubtopicUseCase =
  new CreateTrackerSubtopicUseCase(mongoTrackerRepository)

const updateSubtopicProgressUseCase =
  new UpdateSubtopicProgressUseCase(mongoTrackerRepository)

const getTrackerLessonUseCase =
  new GetTrackerLessonUseCase(mongoTrackerRepository)

const chatWithLessonTutorUseCase =
  new ChatWithLessonTutorUseCase(mongoTrackerRepository)

const runLessonCodeUseCase =
  new RunLessonCodeUseCase(mongoTrackerRepository)

const submitLessonCodeUseCase =
  new SubmitLessonCodeUseCase(mongoTrackerRepository)

const getCodeHintUseCase =
  new GetCodeHintUseCase(mongoTrackerRepository)

const getOptimizedSolutionUseCase =
  new GetOptimizedSolutionUseCase(mongoTrackerRepository)

const verifyLessonAnswerUseCase =
  new VerifyLessonAnswerUseCase(mongoTrackerRepository)

const addMissingEvaluationTopicUseCase =
  new AddMissingEvaluationTopicUseCase(mongoTrackerRepository)

  const verifyTrackerTopicUseCase =
  new VerifyTrackerTopicUseCase(mongoTrackerRepository)

const verifyTrackerSubtopicUseCase =
  new VerifyTrackerSubtopicUseCase(mongoTrackerRepository)

  const getLessonGeneratedQuestionsUseCase =
  new GetLessonGeneratedQuestionsUseCase(mongoTrackerRepository)

const generateLessonQuestionsUseCase =
  new GenerateLessonQuestionsUseCase(mongoTrackerRepository)

const getLessonQuestionSolutionUseCase =
  new GetLessonQuestionSolutionUseCase(mongoTrackerRepository)

const generateLessonQuestionSolutionUseCase =
  new GenerateLessonQuestionSolutionUseCase(mongoTrackerRepository)

const getLessonQuestionSolutionDoubtsUseCase =
  new GetLessonQuestionSolutionDoubtsUseCase(mongoTrackerRepository)

const askLessonQuestionSolutionDoubtUseCase =
  new AskLessonQuestionSolutionDoubtUseCase(mongoTrackerRepository)

  const clearLessonChatHistoryUseCase =
  new ClearLessonChatHistoryUseCase(mongoTrackerRepository)

const clearLessonQuestionSolutionDoubtsUseCase =
  new ClearLessonQuestionSolutionDoubtsUseCase(mongoTrackerRepository)

  const generateLessonVisualizationUseCase =
  new GenerateLessonVisualizationUseCase(mongoTrackerRepository)

export const trackerController = {
  getSummary: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await getTrackerSummaryUseCase.execute(
        req.user!.userId
      )

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

      const result = await listTrackersUseCase.execute({
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

      const result = await createTrackerUseCase.execute({
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
      const result =
        await getTrackerDetailsUseCase.execute({
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

      const result = await updateTrackerUseCase.execute({
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
      const result = await deleteTrackerUseCase.execute({
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
      const result = await archiveTrackerUseCase.execute({
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
      const result = await restoreTrackerUseCase.execute({
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
      const result = await publishTrackerUseCase.execute({
        trackerId: req.params.trackerId,
        userId: req.user!.userId,
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
      const result = await unpublishTrackerUseCase.execute({
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
      const result =
        await getTrackerRoadmapUseCase.execute({
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

      const result =
        await createTrackerTopicUseCase.execute({
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

      const result =
        await createTrackerSubtopicUseCase.execute({
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
      const body =
        updateSubtopicProgressSchema.parse(req.body)

      const result =
        await updateSubtopicProgressUseCase.execute({
          trackerId: req.params.trackerId,
          subtopicId: req.params.subtopicId,
          userId: req.user!.userId,
          status: body.status,
          timeSpentMinutes: body.timeSpentMinutes,
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
      const result =
        await getTrackerLessonUseCase.execute({
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

  chatWithLessonTutor: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = lessonChatSchema.parse(req.body)

      const result =
        await chatWithLessonTutorUseCase.execute({
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

  runLessonCode: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = runLessonCodeSchema.parse(req.body)

      const result =
        await runLessonCodeUseCase.execute({
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

      const result =
        await submitLessonCodeUseCase.execute({
          trackerId: req.params.trackerId,
          subtopicId: req.params.subtopicId,
          userId: req.user!.userId,
          sourceCode: body.sourceCode,
          // FIX: body.languageId is number | undefined; default to 63 (JavaScript)
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

      const result =
        await getCodeHintUseCase.execute({
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
      const body =
        getOptimizedSolutionSchema.parse(req.body)

      const result =
        await getOptimizedSolutionUseCase.execute({
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

  verifyLessonAnswer: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyLessonAnswerSchema.parse(req.body)

      const result =
        await verifyLessonAnswerUseCase.execute({
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

  addMissingEvaluationTopic: async (
    req: Request<AddMissingTopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await addMissingEvaluationTopicUseCase.execute({
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

  verifyTopic: async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const body = verifyTopicSchema.parse(req.body)

      const result = await verifyTrackerTopicUseCase.execute({
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

      const result = await verifyTrackerSubtopicUseCase.execute({
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
    getLessonChatHistory: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await mongoTrackerRepository.getLessonChatMessages({
          trackerId: req.params.trackerId,
          subtopicId: req.params.subtopicId,
          userId: req.user!.userId,
          scope: 'lesson_doubt_chat',
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

  getLessonAnswerAttempts: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await mongoTrackerRepository.getLessonAnswerAttempts({
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

      const result =
        await mongoTrackerRepository.getLessonCodeSubmissions({
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
    getLessonGeneratedQuestions: async (
    req: Request<LessonParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result =
        await getLessonGeneratedQuestionsUseCase.execute({
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

      const result = await generateLessonQuestionsUseCase.execute({
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

      const result =
        await getLessonQuestionSolutionUseCase.execute({
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

      const result =
        await generateLessonQuestionSolutionUseCase.execute({
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

      const result =
        await getLessonQuestionSolutionDoubtsUseCase.execute({
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

      const result =
        await askLessonQuestionSolutionDoubtUseCase.execute({
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

  clearLessonChatHistory: async (
  req: Request<LessonParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await clearLessonChatHistoryUseCase.execute({
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

    const result =
      await clearLessonQuestionSolutionDoubtsUseCase.execute({
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
generateLessonVisualization: async (
  req: Request<LessonParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await generateLessonVisualizationUseCase.execute({
      trackerId: req.params.trackerId,
      subtopicId: req.params.subtopicId,
      userId: req.user!.userId,
      regenerate: req.query.regenerate === 'true',   // ← reads ?regenerate=true
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