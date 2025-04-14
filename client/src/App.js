import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import InterestSelection from './pages/InterestSelection';
import ChatRoom from './pages/ChatRoom';

// Private route component
const PrivateRoute = ({ element }) => {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect to interest selection if interest not set
  if (currentUser && !currentUser.interest) {
    return <Navigate to="/select-interest" />;
  }

  return element;
};

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Semi-protected route - only requires authentication */}
        <Route
          path="/select-interest"
          element={currentUser ? <InterestSelection /> : <Navigate to="/login" />}
        />

        {/* Fully protected route - requires authentication and interest */}
        <Route
          path="/chat"
          element={
            <PrivateRoute
              element={<ChatRoom />}
            />
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={currentUser ? (currentUser.interest ? "/chat" : "/select-interest") : "/login"} />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />

        {/* Audio element for notification sound (hidden) */}
        <audio id="message-notification" preload="auto" style={{ display: 'none' }}>
          <source src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_c8a410a6c6.mp3?filename=notification-sound-7062.mp3" type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;