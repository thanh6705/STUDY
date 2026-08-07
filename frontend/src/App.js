import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import MainApp from './components/MainApp';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/App.css';

// Component con để xử lý routing dựa trên trạng thái từ AuthContext
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Nếu đã có thông tin user thì coi như đã xác thực
  const isAuthenticated = !!user;

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/app" replace /> : <Register />} 
      />
      <Route 
        path="/app/*" 
        element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/app" : "/login"} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;