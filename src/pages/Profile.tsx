import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useArticleStore } from '../stores/articleStore';
import { PenSquare, Calendar, Edit, Trash2, BookOpen } from 'lucide-react';

export const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { articles, fetchArticles, fetchArticlesByAuthor, deleteArticle, loading } =
    useArticleStore();
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [userArticles, setUserArticles] = useState<any[]>([]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (user) {
      const loadUserArticles = async () => {
        try {
          const articles = await fetchArticlesByAuthor(user.id);
          setUserArticles(articles);
        } catch (err) {
          // Error handled by store
        }
      };
      loadUserArticles();
    }
  }, [user, fetchArticlesByAuthor]);
  const publishedArticles = userArticles.filter((a) => a.status === 'published');
  const draftArticles = userArticles.filter((a) => a.status === 'draft');

  const displayedArticles = activeTab === 'published' ? publishedArticles : draftArticles;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('确定要删除这篇文章吗？此操作不可撤销。');
    if (confirmed) {
      try {
        await deleteArticle(id);
      } catch (err) {
        // Error handled by store
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            请先登录
          </h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  user?.avatar ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                }
                alt={user?.username}
                className="w-32 h-32 rounded-full border-4 border-primary-200 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {user?.username}
              </h1>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              {user?.bio && (
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {publishedArticles.length}
                  </div>
                  <div className="text-sm text-gray-600">已发布</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {draftArticles.length}
                  </div>
                  <div className="text-sm text-gray-600">草稿</div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Link
              to="/create"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PenSquare className="w-5 h-5" />
              <span>创作文章</span>
            </Link>
          </div>
        </div>

        {/* Articles Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-slide-up">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('published')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'published'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                已发布 ({publishedArticles.length})
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'drafts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                草稿 ({draftArticles.length})
              </button>
            </nav>
          </div>

          {/* Article List */}
          <div className="p-8">
            {displayedArticles.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'published' ? '暂无已发布的文章' : '暂无草稿'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'published'
                    ? '开始创作你的第一篇文章吧'
                    : '保存的文章会显示在这里'}
                </p>
                {activeTab === 'published' && (
                  <Link
                    to="/create"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PenSquare className="w-5 h-5" />
                    <span>创作文章</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Article Info */}
                    <div className="flex-grow">
                      <Link
                        to={`/article/${article.id}`}
                        className="block group-hover:text-primary-600 transition-colors"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {article.status === 'published' && (
                        <Link
                          to={`/article/${article.id}`}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看"
                        >
                          <BookOpen className="w-5 h-5" />
                        </Link>
                      )}
                      <Link
                        to={`/edit/${article.id}`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        disabled={loading}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="删除"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
