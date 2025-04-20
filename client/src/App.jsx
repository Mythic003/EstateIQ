import React from 'react';
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
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import PredictionPage from './pages/PredictionPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/predict" element={<PredictionPage />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/history" element={<RecentlyViewed />} />
                  </Route>
                </Route>
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
