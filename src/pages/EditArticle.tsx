import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useArticleStore } from '../stores/articleStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AlertCircle, Save, Send, ArrowLeft } from 'lucide-react';

const categories = ['技术', '生活', '旅游', '美食', '读书', '心情', '其他'];

export const EditArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentArticle, fetchArticleById, updateArticle, loading, error } =
    useArticleStore();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '技术',
    tags: '',
  });

  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    if (id) {
      fetchArticleById(id);
    }
  }, [id, fetchArticleById]);

  useEffect(() => {
    if (currentArticle) {
      setFormData({
        title: currentArticle.title,
        content: currentArticle.content,
        summary: currentArticle.summary,
        category: currentArticle.category,
        tags: currentArticle.tags.join(', '),
      });
    }
  }, [currentArticle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPublishError('');
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
    setPublishError('');
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      setPublishError('请输入文章标题');
      return;
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      setPublishError('请输入文章内容');
      return;
    }

    if (!formData.summary.trim()) {
      setPublishError('请输入文章摘要');
      return;
    }

    try {
      await updateArticle(id!, {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      });

      if (status === 'published') {
        navigate(`/article/${id}`);
      } else {
        navigate('/profile');
      }
    } catch (err) {
      // Error handled by store
    }
  };

  const displayError = publishError || error;

  if (!currentArticle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回个人中心</span>
          </Link>
          <h1 className="text-4xl font-display font-bold text-gray-900">
            编辑文章
          </h1>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              文章标题
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-display"
              placeholder="输入一个吸引人的标题..."
            />
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                分类
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                标签
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="标签1, 标签2, 标签3"
              />
              <p className="mt-1 text-sm text-gray-500">多个标签用逗号分隔</p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              文章摘要
            </label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="用简短的文字描述这篇文章..."
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文章内容
            </label>
            <div className="h-96 mb-12">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                className="h-full"
                placeholder="开始写作吧..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>保存草稿</span>
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
              <span>发布文章</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
