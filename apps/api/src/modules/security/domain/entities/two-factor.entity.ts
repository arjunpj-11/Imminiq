import type { TwoFactorStatus } from '../security.types';

export type TwoFactorEntityProps = {
  id?: string | null;
  status: TwoFactorStatus;
  totpSecretEncrypted?: string | null;
};

export class TwoFactorEntity {
  readonly id: string | null;
  readonly status: TwoFactorStatus;
  readonly totpSecretEncrypted: string | null;

  constructor(props: TwoFactorEntityProps) {
    this.id = props.id ?? null;
    this.status = props.status;
    this.totpSecretEncrypted = props.totpSecretEncrypted ?? null;
  }
}
