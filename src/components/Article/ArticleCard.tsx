import { Link } from 'react-router-dom';
import { Article } from '../../types/article';
import { Calendar, User } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

export const ArticleCard = ({ article, index = 0 }: ArticleCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/article/${article.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category & Tags */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {article.category}
          </span>
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-display font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {article.summary}
        </p>

        {/* Author & Date */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <img
              src={article.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={article.author.username}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-gray-700 font-medium">
              {article.author.username}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
