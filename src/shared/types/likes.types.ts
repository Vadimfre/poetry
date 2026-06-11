export interface LikeData {
  liked: boolean;
  likesCount: number;
}

export interface LikeStatus {
  liked: boolean;
}

export interface LikeCount {
  likesCount: number;
}

export interface PostWithLikes {
  id: number;
  title: string;
  content: string;
  likes: LikeData;
}

export interface OptimisticLikeUpdateContext {
  previousData: import("./interactions.types").PoemInteractionsData | undefined;
}
