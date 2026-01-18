import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsListPage from "./pages/TicketsListPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import KbListPage from "./pages/KbListPage";
import KbDetailPage from "./pages/KbDetailPage";
import KbCreatePage from "./pages/KbCreatePage";
import PlaybooksListPage from "./pages/PlaybooksListPage";
import PlaybookDetailPage from "./pages/PlaybookDetailPage";
import PlaybookCreatePage from "./pages/PlaybookCreatePage";
import PlaybookEditPage from "./pages/PlaybookEditPage";
import { AuthProvider, useAuth } from "./state/auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kb"
          element={
            <ProtectedRoute>
              <KbListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kb/new"
          element={
            <ProtectedRoute>
              <KbCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kb/:id"
          element={
            <ProtectedRoute>
              <KbDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbooks"
          element={
            <ProtectedRoute>
              <PlaybooksListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbooks/new"
          element={
            <ProtectedRoute>
              <PlaybookCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbooks/:id"
          element={
            <ProtectedRoute>
              <PlaybookDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playbooks/:id/edit"
          element={
            <ProtectedRoute>
              <PlaybookEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
