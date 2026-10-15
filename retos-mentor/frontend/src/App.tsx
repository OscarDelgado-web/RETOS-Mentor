import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MentorPage from './pages/MentorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mentor" replace />} />
        <Route path="/mentor" element={<MentorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;