import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';
import type { TrackerUseCases } from '../application/tracker-use-cases.contract';

type TrackerParams = { trackerId: string };
type TopicParams = { trackerId: string; topicId: string };
type ContributionParams = { trackerId: string; contributionId: string };
type LessonParams = { trackerId: string; subtopicId: string };
type AddMissingTopicParams = {
  trackerId: string;
  evaluationJobId: string;
  topicIndex: string;
};

export class TrackerRoadmapController {
  constructor(private readonly _useCases: TrackerUseCases) {}

  getRoadmap = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.getTrackerRoadmap.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });

      res.json(new ApiResponse('Tracker roadmap fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  createTopic = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.createTrackerTopic.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        title: req.body.title,
        description: req.body.description,
      });

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Topic created successfully', result));
    } catch (error) {
      next(error);
    }
  };

  createSubtopic = async (req: Request<TopicParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.createTrackerSubtopic.execute({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
        title: req.body.title,
        description: req.body.description,
        parentSubtopicId: req.body.parentSubtopicId,
        estimatedMinutes: req.body.estimatedMinutes,
      });

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Subtopic created successfully', result));
    } catch (error) {
      next(error);
    }
  };

  createTopicContribution = async (
    req: Request<TopicParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.createTopicContribution.execute({
        trackerId: req.params.trackerId,
        topicId: req.params.topicId,
        userId: getAuthUser(req).userId,
      });
      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Topic contribution request sent successfully', result));
    } catch (error) {
      next(error);
    }
  };

  listTopicContributions = async (
    req: Request<TrackerParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.listTopicContributions.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
      });
      res.json(new ApiResponse('Topic contribution requests fetched successfully', result));
    } catch (error) {
      next(error);
    }
  };

  reviewTopicContribution = async (
    req: Request<ContributionParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this._useCases.reviewTopicContribution.execute({
        trackerId: req.params.trackerId,
        contributionId: req.params.contributionId,
        userId: getAuthUser(req).userId,
        action: req.body.action,
        reviewNote: req.body.reviewNote,
      });
      res.json(new ApiResponse('Topic contribution reviewed successfully', result));
    } catch (error) {
      next(error);
    }
  };

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
      });

      res.json(new ApiResponse('Subtopic progress updated successfully', result));
    } catch (error) {
      next(error);
    }
  };

  verifyTopic = async (req: Request<TrackerParams>, res: Response, next: NextFunction) => {
    try {
      const result = await this._useCases.verifyTrackerTopic.execute({
        trackerId: req.params.trackerId,
        userId: getAuthUser(req).userId,
        trackerTitle: req.body.trackerTitle,
        topicTitle: req.body.topicTitle,
        topicDescription: req.body.topicDescription,
        existingTopics: req.body.existingTopics,
      });

      res.json(new ApiResponse('Topic verification completed', result));
    } catch (error) {
      next(error);
    }
  };

  verifySubtopic = async (req: Request<TopicParams>, res: Response, next: NextFunction) => {
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
      });

      res.json(new ApiResponse('Subtopic verification completed', result));
    } catch (error) {
      next(error);
    }
  };

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
      });

      res
        .status(HttpStatusCode.CREATED)
        .json(new ApiResponse('Missing topic added to tracker', result));
    } catch (error) {
      next(error);
    }
  };

}

