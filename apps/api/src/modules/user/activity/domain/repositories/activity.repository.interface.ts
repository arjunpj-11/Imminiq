import type { IActivityCommandRepository } from './activity-command.repository.interface';
import type { IActivityQueryRepository } from './activity-query.repository.interface';

export interface IActivityRepository extends IActivityQueryRepository, IActivityCommandRepository {}
