import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Square, Pause, Play, Check } from 'lucide-react';

interface RecordingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingComplete: (duration: string) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function RecordingDialog({ open, onOpenChange, onRecordingComplete }: RecordingDialogProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(new Array(40).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    mediaStreamRef.current = null;
    audioCtxRef.current = null;
  }, []);

  const updateLevels = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const barCount = 40;
    const step = Math.floor(data.length / barCount);
    const bars: number[] = [];
    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += data[i * step + j];
      bars.push((sum / step) / 255);
    }
    setLevels(bars);
    animFrameRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setState('recording');
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      updateLevels();
    } catch {
      // Microphone permission denied
    }
  }, [updateLevels]);

  const pauseRecording = useCallback(() => {
    setState('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setLevels(prev => prev.map(() => 0));
  }, []);

  const resumeRecording = useCallback(() => {
    setState('recording');
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    updateLevels();
  }, [updateLevels]);

  const stopRecording = useCallback(() => {
    const duration = formatTime(elapsed);
    cleanup();
    setState('idle');
    setElapsed(0);
    setLevels(new Array(40).fill(0));
    onRecordingComplete(duration);
    onOpenChange(false);
  }, [elapsed, cleanup, onRecordingComplete, onOpenChange]);

  useEffect(() => {
    if (!open) {
      cleanup();
      setState('idle');
      setElapsed(0);
      setLevels(new Array(40).fill(0));
    }
  }, [open, cleanup]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
        <div className="flex flex-col items-center px-8 py-10 gap-8">
          <DialogTitle className="font-serif text-xl font-semibold text-foreground">
            {state === 'idle' ? 'Nouvel entretien' : state === 'paused' ? 'En pause' : 'Enregistrement'}
          </DialogTitle>

          {/* Waveform visualization */}
          <div className="flex items-center justify-center gap-[2px] h-24 w-full max-w-xs">
            {levels.map((level, i) => (
              <div
                key={i}
                className="w-[4px] rounded-full bg-primary/60 transition-all duration-75"
                style={{
                  height: `${Math.max(4, level * 96)}px`,
                  opacity: state === 'recording' ? 0.4 + level * 0.6 : 0.2,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <span className="font-mono text-4xl font-light text-foreground tracking-wider">
            {formatTime(elapsed)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-6">
            {state === 'idle' ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <Mic className="w-7 h-7 text-destructive-foreground" />
              </button>
            ) : (
              <>
                {/* Pause / Resume */}
                <button
                  onClick={state === 'paused' ? resumeRecording : pauseRecording}
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  {state === 'paused' ? (
                    <Play className="w-5 h-5 text-foreground ml-0.5" />
                  ) : (
                    <Pause className="w-5 h-5 text-foreground" />
                  )}
                </button>

                {/* Stop */}
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg"
                >
                  <Square className="w-6 h-6 text-destructive-foreground" />
                </button>

                {/* Spacer for visual balance */}
                <div className="w-12" />
              </>
            )}
          </div>

          {state === 'idle' && (
            <p className="text-sm text-muted-foreground font-sans text-center">
              Appuyez sur le bouton pour commencer l'enregistrement
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
