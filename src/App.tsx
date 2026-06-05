import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminLayout } from "@/components/AdminLayout";
import Index from "./pages/Index";
import CalendarPage from "./pages/CalendarPage";
import ReportsAdminPage from "./pages/ReportsAdminPage";
import ParentPortalPage from "./pages/ParentPortalPage";
import CertificatesAdminPage from "./pages/CertificatesAdminPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import CalendarPreviewPage from "./pages/CalendarPreviewPage";


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/parent" element={<ParentPortalPage />} />
            <Route path="/" element={<ProtectedRoute><AdminLayout><Index /></AdminLayout></ProtectedRoute>} />
            <Route path="/kalender" element={<ProtectedRoute><AdminLayout><CalendarPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><AdminLayout><ReportsAdminPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/sertifikat" element={<ProtectedRoute><AdminLayout><CertificatesAdminPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/calendar-preview" element={<CalendarPreviewPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
