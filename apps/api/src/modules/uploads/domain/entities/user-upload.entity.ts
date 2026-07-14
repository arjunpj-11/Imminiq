export type UserUploadEntityProps = {
  _id: string;
  fullName: string;
};

export class UserUploadEntity {
  readonly _id: string;
  readonly fullName: string;

  constructor(props: UserUploadEntityProps) {
    this._id = props._id;
    this.fullName = props.fullName;
  }
}
