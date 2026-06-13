import { UserResponse } from './user';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  author: UserResponse;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}
