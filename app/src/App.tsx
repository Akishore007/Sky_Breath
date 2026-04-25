import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import News from "@/pages/News";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import AIChat from "@/pages/AIChat";
import NotFound from "@/pages/NotFound";
import WeatherUpdateProvider from "@/components/WeatherUpdateProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <WeatherUpdateProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/news"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <News />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Alerts />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-chat"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIChat />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WeatherUpdateProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
