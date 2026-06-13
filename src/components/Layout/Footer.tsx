import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">王耀庄年青人</h3>
            <p className="text-gray-400 leading-relaxed">
              王耀庄年青人聚集地。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/create" className="text-gray-400 hover:text-white transition-colors">
                  开始创作
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">联系我们</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  联系方式
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 flex items-center justify-center space-x-2">
            <span>用</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>构建</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
