import { AppSidebar } from '@/components/AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
