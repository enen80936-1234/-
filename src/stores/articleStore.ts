import { create } from 'zustand';
import { Article, CreateArticleRequest } from '../types/article';
import { articleService } from '../services/articleService';

interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  fetchArticleById: (id: string) => Promise<void>;
  createArticle: (articleData: CreateArticleRequest) => Promise<Article>;
  updateArticle: (id: string, articleData: CreateArticleRequest) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  fetchArticlesByAuthor: (authorId: string) => Promise<Article[]>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  currentArticle: null,
  loading: false,
  error: null,

  fetchArticles: async () => {
    set({ loading: true, error: null });
    try {
      const articles = await articleService.getArticles();
      set({ articles, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchArticleById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const article = await articleService.getArticleById(id);
      set({ currentArticle: article, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createArticle: async (articleData: CreateArticleRequest) => {
    set({ loading: true, error: null });
    try {
      const newArticle = await articleService.createArticle(articleData);
      set((state) => ({
        articles: [newArticle, ...state.articles],
        loading: false,
      }));
      return newArticle;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateArticle: async (id: string, articleData: CreateArticleRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedArticle = await articleService.updateArticle(id, articleData);
      set((state) => ({
        articles: state.articles.map((a) => (a.id === id ? updatedArticle : a)),
        currentArticle: updatedArticle,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteArticle: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await articleService.deleteArticle(id);
      set((state) => ({
        articles: state.articles.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchArticlesByAuthor: async (authorId: string) => {
    set({ loading: true, error: null });
    try {
      const articles = await articleService.getArticlesByAuthor(authorId);
      set({ loading: false });
      return articles;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
