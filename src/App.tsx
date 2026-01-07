import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { store } from '@/store/store';
import Index from "./pages/Index";
import VendorListingPage from "./pages/VendorListingPage";
import ClientListingPage from "./pages/ClientListingPage";
import ClientCreatePage from "./pages/ClientCreatePage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ClientEditPage from "./pages/ClientEditPage";
import VersionListingPage from "./pages/VersionListingPage";
import VersionDetailPage from "./pages/VersionDetailPage";
import ColumnListingPage from "./pages/ColumnListingPage";
import NotFound from "./pages/NotFound";
import AllVersionsListingPage from './pages/AllVersionsListingPage';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vendors" element={<VendorListingPage />} />
              <Route path="/clients" element={<ClientListingPage />} />
              <Route path="/clients/create" element={<ClientCreatePage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/clients/:id/edit" element={<ClientEditPage />} />
              <Route path="/vendors/:vendorId/versions" element={<VersionListingPage />} />
              <Route path="/vendors/:vendorId/versions/:versionId" element={<VersionDetailPage />} />
              <Route path="/versions" element={<AllVersionsListingPage />} />
              <Route path="/columns" element={<ColumnListingPage />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  </ThemeProvider>
);

export default App;
