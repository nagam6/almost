import TeacherDashboardPage, { TeacherOnly } from "./pages/TeacherDashboardPage";
import TeacherExhibitPage from "./pages/TeacherExhibitPage";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import MuseumPage from "./pages/MuseumPage";
import NotFoundPage from "./pages/NotFoundPage";
import ExhibitPage from "./pages/ExhibitPage";
import MuseumRoomPage from "./pages/MuseumRoomPage";
import { AuthProvider, ProtectedRoute } from "./components/AuthProvider";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
export default function App() {
  return (
    <AuthProvider><AppLayout>
      <Routes>
        <Route path="/teacher" element={<ProtectedRoute><TeacherOnly><TeacherDashboardPage /></TeacherOnly></ProtectedRoute>} />
        <Route path="/teacher/new" element={<ProtectedRoute><TeacherOnly><TeacherExhibitPage /></TeacherOnly></ProtectedRoute>} />
        <Route path="/teacher/exhibits/:slug" element={<ProtectedRoute><TeacherOnly><TeacherExhibitPage /></TeacherOnly></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage key="login" mode="login" />} />
        <Route path="/register" element={<AuthPage key="register" mode="register" />} />
        <Route path="/forgot-password" element={<AuthPage key="forgot" mode="forgot-password" />} />
        <Route path="/reset-password" element={<AuthPage key="reset" mode="reset-password" />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/" element={<HomePage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/museum/:roomId" element={<MuseumRoomPage />} />
        <Route path="/museum/exhibits/:exhibitId" element={<ExhibitPage />} />
      </Routes>
    </AppLayout></AuthProvider>
  );
}
