import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/AppContext";
import { ProjectProvider } from "@/lib/ProjectContext";
import HomePage from "./pages/HomePage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewDetailPage from "./pages/InterviewDetailPage";
import ManuscritPage from "./pages/ManuscritPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProjectRoutes() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <NotFound />;
  return (
    <ProjectProvider projectId={projectId}>
      <Routes>
        <Route index element={<InterviewsPage />} />
        <Route path="entretien/:id" element={<InterviewDetailPage />} />
        <Route path="manuscrit" element={<ManuscritPage />} />
      </Routes>
    </ProjectProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projet/:projectId/*" element={<ProjectRoutes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
