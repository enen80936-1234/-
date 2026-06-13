import { MessageCircle, Phone, Mail } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">联系我们</h1>
            <p className="text-gray-600 text-lg">有任何问题或建议，欢迎随时联系我们</p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QQ */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">QQ</h3>
              <p className="text-gray-600 text-lg font-mono">203037149</p>
              <a
                href="tencent://message/?uin=203037149&Site=&Menu=yes"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                立即联系
              </a>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">电话</h3>
              <p className="text-gray-600">暂未公开</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">邮箱</h3>
              <p className="text-gray-600">暂未公开</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">扫描二维码添加好友</h3>
            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
              <div className="text-gray-400 text-sm">QQ二维码占位</div>
            </div>
            <p className="mt-4 text-gray-600">QQ: 203037149</p>
          </div>
        </div>
      </div>
    </div>
  );
};
