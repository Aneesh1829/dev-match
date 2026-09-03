import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemSolverPage from './pages/ProblemSolverPage';
import ProfilePage from './pages/ProfilePage';
import FeedPage from './pages/FeedPage';
import ChatPage from './pages/ChatPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:slug" element={<ProblemSolverPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:userId" element={<ChatPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#2D1F1F',
            border: '1px solid rgba(232, 120, 138, 0.15)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 24px rgba(232, 120, 138, 0.10)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#e11d48', secondary: '#FFFFFF' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
