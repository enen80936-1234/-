import { Article, CreateArticleRequest } from '../types/article';
import { authService } from './authService';
import { getNetworkErrorMessage, parseApiError } from '../lib/apiError';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, init);
    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('请求失败')) {
      throw error;
    }
    throw new Error(getNetworkErrorMessage(error));
  }
}

export const articleService = {
  getArticles: async (): Promise<Article[]> => {
    return fetchJson<Article[]>('/api/articles');
  },

  getArticleById: async (id: string): Promise<Article> => {
    return fetchJson<Article>(`/api/articles/${id}`);
  },

  createArticle: async (
    articleData: CreateArticleRequest
  ): Promise<Article> => {
    const token = authService.getToken();

    return fetchJson<Article>('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });
  },

  updateArticle: async (
    id: string,
    articleData: CreateArticleRequest
  ): Promise<Article> => {
    const token = authService.getToken();

    return fetchJson<Article>(`/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    });
  },

  deleteArticle: async (id: string): Promise<void> => {
    const token = authService.getToken();

    await fetchJson<{ message: string }>(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getArticlesByAuthor: async (authorId: string): Promise<Article[]> => {
    return fetchJson<Article[]>(`/api/articles/user/${authorId}`);
  },
};
