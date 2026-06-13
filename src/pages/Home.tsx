import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArticleStore } from '../stores/articleStore';
import { useAuthStore } from '../stores/authStore';
import { ArticleList } from '../components/Article/ArticleList';
import { PenSquare, Sparkles } from 'lucide-react';

export const Home = () => {
  const { articles, fetchArticles, loading } = useArticleStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden min-h-[500px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("/ba2594be0e9e015031896699aa611fa3.jpg")`,
            backgroundSize: 'cover',
            backgroundPosition: 'top 0% left 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-5xl md:text-6xl font-display font-bold">
                王耀庄年青人
              </h1>
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
              王耀庄年青人聚集地
            </p>
            {!isAuthenticated ? (
              <div className="flex items-center justify-center space-x-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  开始创作
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl border-2 border-white/20"
                >
                  登录
                </Link>
              </div>
            ) : (
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                <PenSquare className="w-5 h-5" />
                <span>创作文章</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f7fafc"
            />
          </svg>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              最新文章
            </h2>
            <p className="text-gray-600 text-lg">
              发现来自创作者们的精彩内容
            </p>
          </div>

          <ArticleList articles={articles} loading={loading} />
        </div>
      </section>
    </div>
  );
};
