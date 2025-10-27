import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AdminAccessProvider } from "@/contexts/AdminAccessContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { RightClickProtection } from "@/components/RightClickProtection";
import { DebugMaintenanceListener } from "@/components/DebugMaintenanceListener";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Legal from "./pages/Legal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AdminAccessProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RightClickProtection />
            <BrowserRouter>
              <MaintenanceGuard>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/legal" element={<Legal />} />
                </Routes>
              </MaintenanceGuard>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AdminAccessProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;