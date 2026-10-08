import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/public/Home';
import Login from './pages/admin/Login';
import './styles/global.css';

import AdminSessions from './pages/admin/Sessions';
import AdminWriteUps from './pages/admin/WriteUps';
import AdminAIBlog from './pages/admin/AIBlog';
import AdminSpeakers from './pages/admin/Speakers';
import AdminEvents from './pages/admin/Events';
import Dashboard from './pages/admin/Dashboard';

import PublicSpeakers from './pages/public/PublicSpeakers';
import ApplySpeaker from './pages/public/ApplySpeaker';
import PublicEvents from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import SpeakerProfile from './pages/public/SpeakerProfile';
import PublicWriteUps from './pages/public/WriteUps';
import PublicAIBlog from './pages/public/AIBlog';
import About from './pages/public/About';
import PublicSessions from './pages/public/Sessions';
import WriteUpDetail from './pages/public/WriteUpDetail';
import AIBlogDetail from './pages/public/AIBlogDetail';
import AdminJobs from './pages/admin/AdminJobs';
import PublicJobs from './pages/public/Jobs';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
           
            {/* PUBLIC ROUTES (With Header & Footer) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<PublicEvents />} />
              <Route path="events/:slug" element={<EventDetail />} />
              <Route path="sessions" element={<PublicSessions />} />
              <Route path="jobs" element={<PublicJobs />} />
              
              <Route path="speakers" element={<PublicSpeakers />} />
              <Route path="speakers/:slug" element={<SpeakerProfile />} />
              
              <Route path="write-ups" element={<PublicWriteUps />} />
              {/* FIXED: Moved WriteUpDetail here so the public can access it! */}
              <Route path="write-ups/:slug" element={<WriteUpDetail />} />
              
              <Route path="ai-blog" element={<PublicAIBlog />} />
              {/* FIXED: Moved AIBlogDetail here as well! */}
              <Route path="ai-blog/:slug" element={<AIBlogDetail />} />
              
              <Route path="about" element={<About />} />
              <Route path="applyspeaker" element={<ApplySpeaker />} />
            </Route>
            
            {/* ADMIN ROUTES */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="speakers" element={<AdminSpeakers />} />
              <Route path="sessions" element={<AdminSessions />} />
              <Route path="write-ups" element={<AdminWriteUps />} />
              <Route path="ai-blog" element={<AdminAIBlog />} />
              <Route path="jobs" element={<AdminJobs />} />
              
            </Route>
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;