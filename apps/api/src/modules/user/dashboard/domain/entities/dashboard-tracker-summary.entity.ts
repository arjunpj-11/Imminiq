import type { DashboardActiveTrackerSnapshot } from '../value-objects/dashboard-active-tracker-snapshot.vo';

export type DashboardTrackerSummaryEntityProps = {
  total: number;
  active: number;
  completed: number;
  activeTrackers: DashboardActiveTrackerSnapshot[];
};

export class DashboardTrackerSummaryEntity {
  readonly total: number;
  readonly active: number;
  readonly completed: number;
  readonly activeTrackers: DashboardActiveTrackerSnapshot[];

  constructor(props: DashboardTrackerSummaryEntityProps) {
    this.total = props.total;
    this.active = props.active;
    this.completed = props.completed;
    this.activeTrackers = props.activeTrackers;
  }
}
