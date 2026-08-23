"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconCamera,
  IconScan,
  IconRefresh,
  IconFlash,
  IconClose,
  IconCheckCircle,
} from "@/components/Icons";

/* Minimal typings for the experimental BarcodeDetector API */
type DetectedBarcode = { rawValue: string; format: string };
type BarcodeDetectorLike = {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
};

export default function CameraScanner({
  onDetected,
  scanning,
}: {
  onDetected: (code: string) => void;
  scanning: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastHitRef = useRef<string>("");

  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [nativeSupport, setNativeSupport] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "BarcodeDetector" in window;
    setNativeSupport(supported);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
    setTorchOn(false);
  }, []);

  useEffect(() => stop, [stop]);

  const detectLoop = useCallback(
    (detector: BarcodeDetectorLike) => {
      const tick = async () => {
        const video = videoRef.current;
        if (!video || video.readyState !== 4) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0) {
            const value = codes[0].rawValue.trim();
            if (value && value !== lastHitRef.current) {
              lastHitRef.current = value;
              if (navigator.vibrate) navigator.vibrate(80);
              onDetected(value);
              setTimeout(() => (lastHitRef.current = ""), 3000);
            }
          }
        } catch {
          /* frame skip */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [onDetected],
  );

  const start = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Este navegador não suporta acesso à câmera.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);

      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities?.() as
        | (MediaTrackCapabilities & { torch?: boolean })
        | undefined;
      setHasTorch(Boolean(caps?.torch));

      if ("BarcodeDetector" in window) {
        const Ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor })
          .BarcodeDetector;
        const detector = new Ctor({
          formats: [
            "ean_13",
            "ean_8",
            "code_128",
            "code_39",
            "upc_a",
            "upc_e",
            "qr_code",
            "itf",
          ],
        });
        detectLoop(detector);
      }
    } catch (e) {
      const msg =
        e instanceof Error && e.name === "NotAllowedError"
          ? "Permissão de câmera negada. Habilite o acesso nas configurações do navegador."
          : e instanceof Error && e.name === "NotFoundError"
            ? "Nenhuma câmera encontrada neste dispositivo."
            : e instanceof Error
              ? e.message
              : "Não foi possível abrir a câmera.";
      setError(msg);
      setActive(false);
    } finally {
      setStarting(false);
    }
  }, [detectLoop]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet & { torch: boolean }],
      });
      setTorchOn((t) => !t);
    } catch {
      setHasTorch(false);
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    if (navigator.vibrate) navigator.vibrate(40);
  }

  return (
    <div>
      <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-black overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Grid overlay */}
        {!active && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(168,85,247,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,.5) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        )}

        {/* Reticle */}
        <div className="absolute inset-8 pointer-events-none">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-purple-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-purple-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-purple-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-purple-400 rounded-br-lg" />
        </div>

        {(active || scanning) && (
          <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.9)] animate-scan" />
        )}

        {/* Idle / error state */}
        {!active && (
          <div className="absolute inset-0 grid place-items-center text-center p-6">
            <div>
              <IconCamera
                width={52}
                height={52}
                className={`mx-auto ${scanning ? "animate-pulse text-purple-300" : "text-slate-500"}`}
              />
              {error ? (
                <>
                  <div className="mt-3 text-sm text-red-300 max-w-xs mx-auto">
                    {error}
                  </div>
                  <button
                    onClick={start}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-purple-600 px-4 py-2 rounded-full text-white"
                  >
                    <IconRefresh width={14} height={14} /> Tentar novamente
                  </button>
                </>
              ) : scanning ? (
                <div className="mt-4 font-mono text-xs text-purple-300">
                  Analisando · verificando hash · comparando preços...
                </div>
              ) : (
                <>
                  <div className="mt-3 text-sm text-slate-300 max-w-xs mx-auto">
                    Ative a câmera e aponte para o código de barras da etiqueta
                    ou caixa do produto.
                  </div>
                  <button
                    onClick={start}
                    disabled={starting}
                    className="mt-4 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-full"
                  >
                    <IconCamera width={17} height={17} />
                    {starting ? "Abrindo câmera..." : "Ativar câmera"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Live badges */}
        {active && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                Ao vivo
              </span>
            </div>
            <div className="absolute top-3 right-3 flex gap-1.5">
              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  aria-label="Lanterna"
                  className={`w-8 h-8 grid place-items-center rounded-full backdrop-blur ${
                    torchOn ? "bg-yellow-400 text-black" : "bg-black/60 text-white"
                  }`}
                >
                  <IconFlash width={15} height={15} />
                </button>
              )}
              <button
                onClick={stop}
                aria-label="Fechar câmera"
                className="w-8 h-8 grid place-items-center rounded-full bg-black/60 backdrop-blur text-white"
              >
                <IconClose width={15} height={15} />
              </button>
            </div>

            <div className="absolute bottom-3 inset-x-3 flex items-center gap-2">
              <div className="flex-1 text-[10px] text-white/80 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-center">
                {nativeSupport
                  ? "Leitura automática ativa — mantenha o código na moldura"
                  : "Leitura automática indisponível neste navegador — digite o código abaixo"}
              </div>
              <button
                onClick={captureFrame}
                aria-label="Capturar"
                className="w-11 h-11 rounded-full bg-white/90 border-4 border-white/50 shrink-0"
              />
            </div>
          </>
        )}
      </div>

      {/* Support note */}
      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400">
        {nativeSupport ? (
          <>
            <IconCheckCircle
              width={14}
              height={14}
              className="text-emerald-400 shrink-0 mt-0.5"
            />
            <span>
              Detecção nativa de código de barras suportada. Funciona melhor no
              Chrome Android e navegadores baseados em Chromium.
            </span>
          </>
        ) : (
          <>
            <IconScan width={14} height={14} className="shrink-0 mt-0.5" />
            <span>
              Seu navegador não expõe a API de leitura automática. A câmera
              continua funcionando — digite o código manualmente abaixo.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
