import type { DashboardBattleOpponent } from '../value-objects/dashboard-battle-opponent.vo';
import type { DashboardBattleResult } from '../value-objects/dashboard-battle-result.vo';

export type DashboardBattleEntityProps = {
  id: string;
  opponent: DashboardBattleOpponent | null;
  result: DashboardBattleResult;
  completedAt: Date;
  myScore?: number;
  opponentScore?: number;
  startedAt?: Date | null;
};

export class DashboardBattleEntity {
  readonly id: string;
  readonly opponent: DashboardBattleOpponent | null;
  readonly myScore: number | undefined;
  readonly opponentScore: number | undefined;
  readonly result: DashboardBattleResult;
  readonly startedAt: Date | null;
  readonly completedAt: Date;

  constructor(props: DashboardBattleEntityProps) {
    this.id = props.id;
    this.opponent = props.opponent;
    this.myScore = props.myScore;
    this.opponentScore = props.opponentScore;
    this.result = props.result;
    this.startedAt = props.startedAt ?? null;
    this.completedAt = props.completedAt;
  }
}
