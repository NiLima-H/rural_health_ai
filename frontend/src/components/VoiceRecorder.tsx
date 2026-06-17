"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Props = {
  onTranscript: (text: string) => void;
};

export function VoiceRecorder({ onTranscript }: Props) {
  const { lang } = useLang();
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setBusy(true);
        try {
          const { text } = await api.transcribe(blob, lang);
          onTranscript(text);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
    } catch (e) {
      setError("Microphone access denied or unavailable.");
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!recording ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="btn-primary disabled:opacity-50"
        >
          🎤 {lang === "bn" ? "ভয়েস ইনপুট" : "Voice input"}
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="inline-flex animate-pulse items-center gap-2 rounded-lg border border-ink bg-ink px-4 py-2 text-sm font-semibold text-bg"
        >
          ◼ {lang === "bn" ? "থামান" : "Stop"}
        </button>
      )}
      {busy && (
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="inline-block h-2 w-2 animate-pulse bg-ink" />
          {lang === "bn" ? "ট্রান্সক্রাইব হচ্ছে..." : "Transcribing..."}
        </span>
      )}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
