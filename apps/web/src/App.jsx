import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import MuseumPage from "./pages/MuseumPage";
import NotFoundPage from "./pages/NotFoundPage";
import ExhibitPage from "./pages/ExhibitPage";
import MuseumRoomPage from "./pages/MuseumRoomPage";
export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/museum/:roomId"element={<MuseumRoomPage />} />
        <Route path="/museum/exhibits/:exhibitId"element={<ExhibitPage />} />
      </Routes>
    </AppLayout>
  );
}