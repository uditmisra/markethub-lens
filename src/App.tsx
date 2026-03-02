import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";

// New marketing-focused pages
import Library from "./pages/Library";
import ProofDetail from "./pages/ProofDetail";
import Coverage from "./pages/Coverage";

// Existing pages (kept for backward compat)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Submit from "./pages/Submit";
import Dashboard from "./pages/Dashboard";
import EvidenceDetail from "./pages/EvidenceDetail";
import EditEvidence from "./pages/EditEvidence";
import AdminReview from "./pages/AdminReview";
import AdminPanel from "./pages/AdminPanel";
import Integrations from "./pages/Integrations";
import Testimonials from "./pages/Testimonials";
import PublicEvidenceDetail from "./pages/PublicEvidenceDetail";
import EmbedWidget from "./pages/EmbedWidget";
import WidgetGenerator from "./pages/WidgetGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/testimonials/:id" element={<PublicEvidenceDetail />} />
            <Route path="/embed" element={<EmbedWidget />} />

            {/* New marketing-focused routes */}
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/library/:id" element={<ProtectedRoute><ProofDetail /></ProtectedRoute>} />
            <Route path="/coverage" element={<ProtectedRoute><Coverage /></ProtectedRoute>} />

            {/* Existing routes (kept for backward compat) */}
            <Route path="/submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/library" replace />} />
            <Route path="/evidence/:id" element={<ProtectedRoute><EvidenceDetail /></ProtectedRoute>} />
            <Route path="/evidence/:id/edit" element={<ProtectedRoute><EditEvidence /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/admin/review" element={<ProtectedRoute><AdminReview /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/widgets" element={<ProtectedRoute><WidgetGenerator /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
