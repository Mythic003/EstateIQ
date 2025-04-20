import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Documentation from './pages/Documentation';
import RecentlyViewed from './pages/RecentlyViewed';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import './App.css';

// Create a separate component for routes to use location
function AnimatedRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/history" element={<RecentlyViewed />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AnimatePresence mode="wait">
            <AnimatedRoutes />
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
