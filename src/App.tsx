import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CreateArticle } from "./pages/CreateArticle";
import { EditArticle } from "./pages/EditArticle";
import { ArticleDetail } from "./pages/ArticleDetail";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import FeeManagement from "./pages/FeeManagement";
import VideoPlayer from "./pages/VideoPlayer";
import { useAuthStore } from "./stores/authStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, initializing } = useAuthStore();

  if (initializing) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        加载中...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="article/:id" element={<ArticleDetail />} />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <CreateArticle />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute>
                <EditArticle />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="contact" element={<Contact />} />
          <Route path="fee" element={<FeeManagement />} />
          <Route path="video" element={<VideoPlayer />} />
        </Route>
      </Routes>
    </Router>
  );
}
