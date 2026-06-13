import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// 显示加载指示器直到React应用准备好
const rootElement = document.getElementById('root')!;
const loadingElement = document.getElementById('loading');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// 隐藏加载指示器
if (loadingElement) {
  loadingElement.style.display = 'none';
}
