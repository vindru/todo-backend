import { BaseModel } from './base-model';
import { LooseObject } from '@typings';

export class Todo extends BaseModel {
  title: string;
  isDeleted: boolean;
  deletedAt: Date;

  constructor(json?: any) {
    super(json);
    if (json) {
      this.title = json.title;
      this.isDeleted = json.isDeleted;
      this.deletedAt = json.deletedAt;
    }
  }

  public serialize(): LooseObject {
    return {
      id: this._id,
      title: this.title,
      deletedAt: this.deletedAt,
    };
  }
}
