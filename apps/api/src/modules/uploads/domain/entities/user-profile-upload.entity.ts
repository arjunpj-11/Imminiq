export type UserProfileUploadEntityProps = {
  _id?: string;
  userId: string;
};

export class UserProfileUploadEntity {
  readonly _id?: string;
  readonly userId: string;

  constructor(props: UserProfileUploadEntityProps) {
    this.userId = props.userId;

    if (props._id !== undefined) {
      this._id = props._id;
    }
  }
}
