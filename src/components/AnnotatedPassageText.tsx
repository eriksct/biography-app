import { ThemeAnnotation } from '@/lib/types';
import { X } from 'lucide-react';

// Theme color map using HSL-based backgrounds
const THEME_COLORS: Record<string, { bg: string; hover: string }> = {};
const PALETTE = [
  { bg: 'bg-blue-100/0', hover: 'hover:bg-blue-100 group-hover/passage:bg-blue-100' },
  { bg: 'bg-amber-100/0', hover: 'hover:bg-amber-100 group-hover/passage:bg-amber-100' },
  { bg: 'bg-emerald-100/0', hover: 'hover:bg-emerald-100 group-hover/passage:bg-emerald-100' },
  { bg: 'bg-purple-100/0', hover: 'hover:bg-purple-100 group-hover/passage:bg-purple-100' },
  { bg: 'bg-rose-100/0', hover: 'hover:bg-rose-100 group-hover/passage:bg-rose-100' },
  { bg: 'bg-cyan-100/0', hover: 'hover:bg-cyan-100 group-hover/passage:bg-cyan-100' },
  { bg: 'bg-orange-100/0', hover: 'hover:bg-orange-100 group-hover/passage:bg-orange-100' },
  { bg: 'bg-lime-100/0', hover: 'hover:bg-lime-100 group-hover/passage:bg-lime-100' },
];

const TAG_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-purple-100 text-purple-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
  'bg-orange-100 text-orange-800',
  'bg-lime-100 text-lime-800',
];

export function getTagColor(theme: string, allThemes: string[]) {
  const idx = allThemes.indexOf(theme);
  return TAG_COLORS[idx >= 0 ? idx % TAG_COLORS.length : 0];
}

function getThemeColor(theme: string, allThemes: string[]) {
  if (!THEME_COLORS[theme]) {
    const idx = allThemes.indexOf(theme);
    THEME_COLORS[theme] = PALETTE[idx >= 0 ? idx % PALETTE.length : 0];
  }
  return THEME_COLORS[theme];
}

// Merge overlapping annotations into segments
interface Segment {
  start: number;
  end: number;
  text: string;
  annotations: ThemeAnnotation[];
}

function buildSegments(text: string, annotations: ThemeAnnotation[]): Segment[] {
  if (!text) return [{ start: 0, end: 0, text: '', annotations: [] }];
  if (!annotations || annotations.length === 0) {
    return [{ start: 0, end: text.length, text, annotations: [] }];
  }

  const points = new Set<number>();
  points.add(0);
  points.add(text.length);
  for (const a of annotations) {
    points.add(a.start);
    points.add(a.end);
  }
  const sorted = [...points].sort((a, b) => a - b);

  const segments: Segment[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i];
    const end = sorted[i + 1];
    const covering = annotations.filter(a => a.start <= start && a.end >= end);
    segments.push({ start, end, text: text.slice(start, end), annotations: covering });
  }
  return segments;
}

interface Props {
  text: string;
  annotations: ThemeAnnotation[];
  allThemes: string[];
  onRemoveAnnotation?: (annotationId: string) => void;
}

export function AnnotatedPassageText({ text, annotations, allThemes, onRemoveAnnotation }: Props) {
  const segments = buildSegments(text, annotations);

  return (
    <span>
      {segments.map((seg, i) => {
        if (seg.annotations.length === 0) {
          return <span key={i}>{seg.text}</span>;
        }
        const primary = seg.annotations[0];
        const colors = getThemeColor(primary.theme, allThemes);
        return (
          <span
            key={i}
            className={`${colors.hover} rounded-sm px-0.5 relative group/ann inline transition-colors duration-200`}
            title={seg.annotations.map(a => a.theme).join(', ')}
          >
            {seg.text}
            {onRemoveAnnotation && seg.annotations.length > 0 && (
              <span className="opacity-0 group-hover/ann:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {seg.annotations.map(a => (
                  <button
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onRemoveAnnotation(a.id); }}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-sans bg-destructive text-destructive-foreground rounded shadow whitespace-nowrap"
                    title={`Retirer « ${a.theme} »`}
                  >
                    <X className="w-2.5 h-2.5" />
                    {a.theme}
                  </button>
                ))}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
