import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { applyTheme, useThemeStore } from '@/store/themeStore';
import { me, refresh } from '@/api/auth';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { AnalysisDetailPage } from '@/pages/AnalysisDetailPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AboutPage } from '@/pages/AboutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  const { setSession, setInitializing } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    // Keeps a "system" choice live if the OS preference changes while the
    // app is open (a manual "light"/"dark" choice is unaffected by this).
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange() {
      if (useThemeStore.getState().theme === 'system') applyTheme('system');
    }
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Silent session restore: the refresh token lives in an httpOnly cookie,
    // invisible to JS, so a page reload otherwise looks logged-out even
    // though the cookie is still valid.
    async function restoreSession() {
      try {
        const { accessToken } = await refresh();
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await me();
        setSession(user, accessToken);
      } catch {
        // No valid refresh cookie — genuinely logged out, nothing to do.
      } finally {
        setInitializing(false);
      }
    }
    restoreSession();
  }, [setSession, setInitializing]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster theme={theme} position="top-right" richColors closeButton />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <AnalysisPage />
                </ProtectedRoute>
              }
            />
            {/* Not wrapped in ProtectedRoute: the backend allows anyone holding
                the id to view an anonymous (no-account) analysis (FR-11.3);
                it 403s server-side for analyses owned by a different account. */}
            <Route path="/analyze/:id" element={<AnalysisDetailPage />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/analyze" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
