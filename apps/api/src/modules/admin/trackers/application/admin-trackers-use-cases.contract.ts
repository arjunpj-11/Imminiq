import type { IDeleteAdminTrackerUseCase } from './use-cases/delete-admin-tracker.usecase';
import type { IGetAdminTrackerDetailUseCase } from './use-cases/get-admin-tracker-detail.usecase';
import type { ILikeAdminPublishedTrackerUseCase } from './use-cases/like-admin-published-tracker.usecase';
import type { IListAdminPublishedTrackersUseCase } from './use-cases/list-admin-published-trackers.usecase';
import type { IListAdminTrackersUseCase } from './use-cases/list-admin-trackers.usecase';
import type { IRateAdminPublishedTrackerUseCase } from './use-cases/rate-admin-published-tracker.usecase';

export type AdminTrackersUseCases = {
  list: IListAdminTrackersUseCase;
  listPublished: IListAdminPublishedTrackersUseCase;
  likePublished: ILikeAdminPublishedTrackerUseCase;
  ratePublished: IRateAdminPublishedTrackerUseCase;
  getDetail: IGetAdminTrackerDetailUseCase;
  delete: IDeleteAdminTrackerUseCase;
};
