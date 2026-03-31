import { useProject } from '@/lib/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Mic, FileText, CheckCircle, Plus } from 'lucide-react';
import { InterviewStatus } from '@/lib/types';
import { AppLayout } from '@/components/AppLayout';

const statusConfig: Record<InterviewStatus, { icon: React.ElementType; label: string; className: string }> = {
  recording: { icon: Mic, label: 'En cours', className: 'text-primary' },
  transcribed: { icon: FileText, label: 'Transcrit', className: 'text-muted-foreground' },
  processed: { icon: CheckCircle, label: 'Traité', className: 'text-accent' },
};

export default function InterviewsPage() {
  const { project } = useProject();
  const navigate = useNavigate();

  const sortedInterviews = [...project.interviews].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-serif font-semibold">Mes entretiens</h1>
          <button className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-md font-sans text-content-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" />
            Nouvel entretien
          </button>
        </div>

        <div className="space-y-4">
          {sortedInterviews.map((interview) => {
            const status = statusConfig[interview.status];
            const StatusIcon = status.icon;
            const dateFormatted = new Date(interview.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <button
                key={interview.id}
                onClick={() => navigate(`/entretien/${interview.id}`)}
                className="w-full text-left bg-card hover:bg-secondary/50 border border-border rounded-lg p-6 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-serif font-semibold text-muted-foreground">
                      {String(interview.number).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-sans text-content font-medium text-foreground">
                        Entretien n°{interview.number}
                      </p>
                      <p className="font-sans text-sm text-muted-foreground mt-1">
                        {dateFormatted} · {interview.duration}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${status.className}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="font-sans text-sm">{status.label}</span>
                  </div>
                </div>
                {interview.themes.length > 0 && (
                  <div className="flex gap-2 mt-4 ml-14">
                    {interview.themes.map((theme) => (
                      <span
                        key={theme}
                        className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-secondary text-secondary-foreground"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
