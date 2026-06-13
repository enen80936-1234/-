import { Article, CreateArticleRequest } from '../types/article';
import { authService } from './authService';

export const articleService = {
  getArticles: async (): Promise<Article[]> => {
    const response = await fetch('/api/articles');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },

  getArticleById: async (id: string): Promise<Article> => {
    const response = await fetch(`/api/articles/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },

  createArticle: async (
    articleData: CreateArticleRequest
  ): Promise<Article> => {
    const token = authService.getToken();

    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },

  updateArticle: async (
    id: string,
    articleData: CreateArticleRequest
  ): Promise<Article> => {
    const token = authService.getToken();

    const response = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },

  deleteArticle: async (id: string): Promise<void> => {
    const token = authService.getToken();

    const response = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  },

  getArticlesByAuthor: async (authorId: string): Promise<Article[]> => {
    const response = await fetch(`/api/articles/user/${authorId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },
};
