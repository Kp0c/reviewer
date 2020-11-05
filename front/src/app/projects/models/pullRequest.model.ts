export interface PullRequest {
  creator: string;
  createdAt: Date;
  comments: DbObject[];
  reviews: DbObject[];
}

interface DbObject {
  id: string;
  creator: string;
}
