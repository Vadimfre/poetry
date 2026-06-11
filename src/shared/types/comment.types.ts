export interface Comment {
  id: number;
  text: string;
  userId: number;
  poemId: number;
  parentId?: number | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  parent?: {
    id: number;
    text: string;
    userId: number;
    user?: {
      id: number;
      name: string | null;
      avatar: string | null;
    };
  };
}

export interface CreateCommentDto {
  text: string;
  parentId?: number;
}

export interface UpdateCommentDto {
  text: string;
}
