import { ThemeAnnotation } from '@/lib/types';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// HSL colors for inline styles — allows layering & blending
const PALETTE_HSL = [
  { h: 217, s: 80, l: 85 }, // blue
  { h: 45,  s: 80, l: 85 }, // amber
  { h: 152, s: 60, l: 82 }, // emerald
  { h: 270, s: 60, l: 87 }, // purple
  { h: 350, s: 70, l: 87 }, // rose
  { h: 190, s: 70, l: 85 }, // cyan
  { h: 25,  s: 80, l: 85 }, // orange
  { h: 85,  s: 60, l: 85 }, // lime
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

function getThemeHSL(theme: string, allThemes: string[]) {
  const idx = allThemes.indexOf(theme);
  return PALETTE_HSL[idx >= 0 ? idx % PALETTE_HSL.length : 0];
}

// Darker version of theme color for underlines
function getUnderlineColor(theme: string, allThemes: string[]) {
  const c = getThemeHSL(theme, allThemes);
  return `hsl(${c.h}, ${c.s}%, ${Math.max(c.l - 30, 40)}%)`;
}

// Blended background for multiple overlapping annotations
function getBlendedBackground(annotations: ThemeAnnotation[], allThemes: string[]): string {
  if (annotations.length === 1) {
    const c = getThemeHSL(annotations[0].theme, allThemes);
    return `hsla(${c.h}, ${c.s}%, ${c.l}%, 0.6)`;
  }
  // Blend all annotation colors with lower opacity each
  const opacity = Math.max(0.3, 0.7 / annotations.length);
  const colors = annotations.map(a => {
    const c = getThemeHSL(a.theme, allThemes);
    return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${opacity})`;
  });
  // Use layered gradient to show all colors
  const stops = colors.map((col, i) => {
    const pctStart = (i / colors.length) * 100;
    const pctEnd = ((i + 1) / colors.length) * 100;
    return `${col} ${pctStart}%, ${col} ${pctEnd}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

// Build stacked underlines as background gradients (avoids box-shadow blending)
function getUnderlineStyles(annotations: ThemeAnnotation[], allThemes: string[]): React.CSSProperties {
  const lineHeight = 2;
  const gap = 1;
  const images: string[] = [];
  const sizes: string[] = [];
  const positions: string[] = [];

  annotations.forEach((a, i) => {
    const color = getUnderlineColor(a.theme, allThemes);
    const yOffset = i * (lineHeight + gap);
    images.push(`linear-gradient(${color}, ${color})`);
    sizes.push(`100% ${lineHeight}px`);
    positions.push(`0 calc(100% - ${yOffset}px)`);
  });

  return {
    backgroundImage: images.join(', '),
    backgroundSize: sizes.join(', '),
    backgroundPosition: positions.join(', '),
    backgroundRepeat: 'no-repeat',
  };
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
  const isMobile = useIsMobile();

  // On mobile: render as plain text — no highlighting, no annotation interactions
  if (isMobile) {
    return <span>{text}</span>;
  }

  const segments = buildSegments(text, annotations);

  return (
    <span>
      {segments.map((seg, i) => {
        if (seg.annotations.length === 0) {
          return <span key={i}>{seg.text}</span>;
        }

        const underlineStyles = getUnderlineStyles(seg.annotations, allThemes);
        const isMulti = seg.annotations.length > 1;
        const paddingBottom = isMulti ? `${seg.annotations.length * 3 + 2}px` : '4px';

        return (
          <span
            key={i}
            className="rounded px-0.5 relative group/ann inline transition-colors duration-200"
            style={{
              background: getBlendedBackground(seg.annotations, allThemes),
              paddingTop: '2px',
              paddingBottom,
              ...underlineStyles,
            }}
            title={seg.annotations.map(a => a.theme).join(', ')}
          >
            {seg.text}
            {onRemoveAnnotation && seg.annotations.length > 0 && (
              <span data-annotation-controls className="pointer-events-none group-hover/ann:pointer-events-auto opacity-0 group-hover/ann:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1 z-20">
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
