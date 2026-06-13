import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useArticleStore } from '../stores/articleStore';
import { useAuthStore } from '../stores/authStore';
import { Calendar, User, Edit, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';

export const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentArticle, fetchArticleById, deleteArticle, loading, error } =
    useArticleStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchArticleById(id);
    }
  }, [id, fetchArticleById]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = window.confirm('确定要删除这篇文章吗？此操作不可撤销。');
    if (confirmed) {
      try {
        await deleteArticle(id);
        navigate('/');
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const canModify = isAuthenticated && user?.id === currentArticle?.authorId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  if (error || !currentArticle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            文章不存在
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '抱歉，您访问的文章不存在或已被删除。'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首页</span>
        </Link>

        {/* Article Card */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in">
          {/* Cover Image */}
          {currentArticle.coverImage && (
            <div className="relative h-96">
              <img
                src={currentArticle.coverImage}
                alt={currentArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                {currentArticle.category}
              </span>
              {currentArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
              {currentArticle.title}
            </h1>

            {/* Author & Date */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={
                    currentArticle.author.avatar ||
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                  }
                  alt={currentArticle.author.username}
                  className="w-14 h-14 rounded-full border-2 border-gray-200"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {currentArticle.author.username}
                  </p>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentArticle.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canModify && (
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/edit/${currentArticle.id}`}
                    className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="编辑文章"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="删除文章"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
              style={{
                fontFamily: "'Source Sans Pro', sans-serif",
                lineHeight: '1.8',
              }}
            />

            {/* Article Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">摘要</h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentArticle.summary}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
