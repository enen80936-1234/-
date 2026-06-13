import { Article } from '../../types/article';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
}

export const ArticleList = ({ articles, loading }: ArticleListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-16 bg-gray-200 rounded" />
              <div className="flex items-center space-x-2 pt-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无文章</h3>
        <p className="text-gray-500">还没有人发布文章，快来成为第一个吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
};
