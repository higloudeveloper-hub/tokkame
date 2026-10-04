"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { createPost } from "@/lib/actions";
import { FILTERS, TRACKS } from "@/lib/kit";

const PRICES = [3, 5, 9, 15, 25];

function blobOf(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}

function putFile(input: HTMLInputElement, blob: Blob, name: string) {
  const data = new DataTransfer();
  data.items.add(new File([blob], name, { type: blob.type || "image/jpeg" }));
  input.files = data.files;
}

const LOOKS = [
  { id: "normal", es: "Original", en: "Original", soft: 0, mark: "Or" },
  { id: "piel", es: "Piel", en: "Skin", soft: 8, mark: "Pi" },
  { id: "belleza", es: "Belleza", en: "Beauty", soft: 12, mark: "Be" },
  { id: "porcelana", es: "Porcelana", en: "Porcelain", soft: 16, mark: "Po" },
  { id: "glow", es: "Glow", en: "Glow", soft: 4, mark: "Gl" },
  { id: "estudio", es: "Estudio", en: "Studio", soft: 0, mark: "Es" },
  { id: "calido", es: "Cálido", en: "Warm", soft: 0, mark: "Ca" },
  { id: "noir", es: "Noir", en: "Noir", soft: 0, mark: "No" },
] as const;

function frameOf(video: HTMLVideoElement, filter: string, mirror: boolean, soft: number) {
  const canvas = document.createElement("canvas");
  const ratio = 4 / 5;
  let sw = video.videoWidth;
  let sh = video.videoHeight;
  let sx = 0;
  let sy = 0;
  if (sw / sh > ratio) {
    sw = sh * ratio;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = sw / ratio;
    sy = (video.videoHeight - sh) / 2;
  }
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.save();
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.filter = filter === "none" ? "none" : filter;
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.filter = "none";
  if (soft > 0) {
    const blur = document.createElement("canvas");
    blur.width = canvas.width;
    blur.height = canvas.height;
    const bctx = blur.getContext("2d");
    if (bctx) {
      bctx.filter = `blur(${soft}px)`;
      bctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = soft > 10 ? 0.55 : 0.4;
      ctx.drawImage(blur, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255, 214, 196, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  return canvas;
}

export function CameraStudio({ canCharge, lang }: { canCharge: boolean; lang: "en" | "es" }) {
  const es = lang === "es";
  const videoRef = useRef<HTMLVideoElement>(null);
  const sharpRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLInputElement>(null);
  const clipRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const sending = useRef(false);
  const counting = useRef(false);
  const drawTimer = useRef<number>(0);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [mode, setMode] = useState<"foto" | "video">("foto");
  const [filter, setFilter] = useState<(typeof LOOKS)[number]["id"]>("normal");
  const [timer, setTimer] = useState(0);
  const [count, setCount] = useState(0);
  const [shot, setShot] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [paid, setPaid] = useState(false);
  const [price, setPrice] = useState(5);
  const [track, setTrack] = useState("");
  const [ownMusic, setOwnMusic] = useState(false);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const look = LOOKS.find((item) => item.id === filter) ?? LOOKS[0];
  const css = FILTERS.find((item) => item.id === filter)?.css || "none";
  const soft = look.soft;
  const preview = css === "none" ? "none" : css;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let gone = false;
    if (!shot && !clipUrl) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: facing }, audio: false })
        .then(async (next) => {
          if (gone) {
            next.getTracks().forEach((item) => item.stop());
            return;
          }
          stream = next;
          if (videoRef.current) {
            videoRef.current.srcObject = next;
            await videoRef.current.play();
          }
        })
        .catch(() => setError(es ? "La cámara no dio permiso. Puedes elegir una foto." : "The camera did not allow access. You can choose a photo."));
    }
    return () => {
      gone = true;
      stream?.getTracks().forEach((item) => item.stop());
    };
  }, [facing, shot, clipUrl, es]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  function paintFrame() {
    const video = videoRef.current;
    if (!video?.videoWidth) return null;
    const canvas = frameOf(video, css, facing === "user", soft);
    if (canvas) sharpRef.current = canvas;
    return canvas;
  }

  function takePhoto() {
    const canvas = paintFrame();
    if (!canvas) {
      setError(es ? "Espera a que la cámara abra." : "Wait for the camera to open.");
      return;
    }
    setShot(canvas.toDataURL("image/jpeg", 0.92));
    setError("");
  }

  function shutter() {
    if (counting.current || recording) return;
    if (timer > 0) {
      counting.current = true;
      setCount(timer);
      let left = timer;
      const id = window.setInterval(() => {
        left -= 1;
        setCount(left);
        if (left <= 0) {
          window.clearInterval(id);
          counting.current = false;
          takePhoto();
        }
      }, 1000);
      return;
    }
    takePhoto();
  }

  function stopRecord() {
    window.clearTimeout(drawTimer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    setRecording(false);
  }

  function startRecord() {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      setError(es ? "Espera a que la cámara abra." : "Wait for the camera to open.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      const frame = frameOf(video, css, facing === "user", soft);
      if (frame) {
        sharpRef.current = frame;
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
      }
      drawTimer.current = window.setTimeout(draw, 50);
    };
    draw();
    if (!canvas.captureStream) {
      setError(es ? "Este navegador no puede grabar el video." : "This browser cannot record the video.");
      return;
    }
    const stream = canvas.captureStream(20);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
      ? "video/webm;codecs=vp8"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 800_000 });
    chunks.current = [];
    rec.ondataavailable = (event) => {
      if (event.data.size) chunks.current.push(event.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType });
      setClipUrl(URL.createObjectURL(blob));
      setShot(sharpRef.current?.toDataURL("image/jpeg", 0.9) || "");
    };
    recorder.current = rec;
    setSeconds(0);
    setRecording(true);
    rec.start();
    window.setTimeout(() => {
      if (rec.state === "recording") stopRecord();
    }, 8000);
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ratio = 4 / 5;
      let sw = img.width;
      let sh = img.height;
      let sx = 0;
      let sy = 0;
      if (sw / sh > ratio) {
        sw = sh * ratio;
        sx = (img.width - sw) / 2;
      } else {
        sh = sw / ratio;
        sy = (img.height - sh) / 2;
      }
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = preview;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      sharpRef.current = canvas;
      setShot(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.src = url;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (sending.current) return;
    event.preventDefault();
    setPosting(true);
    const sharp = sharpRef.current;
    if (!sharp || !fileRef.current || !fullRef.current || !clipRef.current || !formRef.current) {
      setPosting(false);
      setError(es ? "Toma la foto o el video primero." : "Take the photo or the video first.");
      return;
    }
    const cover = document.createElement("canvas");
    cover.width = sharp.width;
    cover.height = sharp.height;
    const ctx = cover.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(sharp, 0, 0);
    if (paid) {
      ctx.filter = "blur(18px)";
      ctx.drawImage(sharp, 0, 0);
    }
    const coverBlob = await blobOf(paid ? cover : sharp);
    const fullBlob = paid && !clipUrl ? await blobOf(sharp) : null;
    if (!coverBlob) {
      setPosting(false);
      return;
    }
    putFile(fileRef.current, coverBlob, "cover.jpg");
    if (fullBlob) putFile(fullRef.current, fullBlob, "full.jpg");
    if (clipUrl && chunks.current.length && clipRef.current) {
      const type = (recorder.current?.mimeType || "").includes("mp4") ? "video/mp4" : "video/webm";
      const blob = new Blob(chunks.current, { type });
      putFile(clipRef.current, blob, type === "video/mp4" ? "clip.mp4" : "clip.webm");
    }
    sending.current = true;
    formRef.current.requestSubmit();
  }

  const reviewing = Boolean(shot || clipUrl);

  return (
    <section className="cam-app">
      <div className="cam-mode">
        <button type="button" className={mode === "foto" ? "on" : ""} onClick={() => setMode("foto")}>{es ? "Foto" : "Photo"}</button>
        <button type="button" className={mode === "video" ? "on" : ""} onClick={() => setMode("video")}>{es ? "Video" : "Video"}</button>
      </div>
      <div className="cam-stage">
        {clipUrl ? <video src={clipUrl} poster={shot} playsInline controls /> : shot ? <img src={shot} alt="" /> : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ filter: preview, transform: facing === "user" ? "scaleX(-1)" : undefined }}
          />
        )}
        {soft > 0 && !reviewing ? <div className="cam-skin" /> : null}
        {!reviewing ? (
          <div className="cam-rail">
            <button type="button" onClick={() => setFacing((value) => (value === "user" ? "environment" : "user"))}>
              <i>↺</i>
              <span>{es ? "Girar" : "Flip"}</span>
            </button>
            {LOOKS.map((item) => (
              <button key={item.id} type="button" className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
                <i>{item.mark}</i>
                <span>{es ? item.es : item.en}</span>
              </button>
            ))}
          </div>
        ) : null}
        {count > 0 ? <b className="cam-count">{count}</b> : null}
        {recording ? <b className="cam-rec">0:{String(Math.min(seconds, 8)).padStart(2, "0")}</b> : null}
      </div>

      {!reviewing ? (
        <>
          <div className="cam-shutter-row">
            <button type="button" className="cam-flip" onClick={() => setTimer((value) => (value ? 0 : 3))}>{timer ? "3s" : (es ? "Tiempo" : "Timer")}</button>
            {mode === "foto" ? (
              <button type="button" className="cam-shutter" onClick={shutter} aria-label={es ? "Tomar foto" : "Take photo"} />
            ) : (
              <button type="button" className={`cam-shutter${recording ? " is-rec" : ""}`} onClick={recording ? stopRecord : startRecord} aria-label={es ? "Grabar" : "Record"} />
            )}
            <label className="cam-flip">
              {es ? "Rollo" : "Roll"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
            </label>
          </div>
        </>
      ) : (
        <form ref={formRef} action={createPost} className="cam-dock" onSubmit={onSubmit}>
          <input ref={fileRef} name="file" type="file" hidden />
          <input ref={fullRef} name="full" type="file" hidden />
          <input ref={clipRef} name="clip" type="file" hidden />
          <input ref={audioRef} name="audio" type="file" accept="audio/mpeg,audio/wav,audio/mp4,audio/aac" hidden />
          <input type="hidden" name="filter" value={filter} />
          <input type="hidden" name="format" value={clipUrl ? "clip" : "foto"} />
          <input type="hidden" name="back" value="/" />
          <input type="hidden" name="track" value={track} />
          <input type="hidden" name="visibility" value={paid ? "ppv" : "public"} />
          <input type="hidden" name="price" value={paid ? price : 0} />
          <div className="cam-mode">
            <button type="button" className={!paid ? "on" : ""} onClick={() => setPaid(false)}>{es ? "Gratis" : "Free"}</button>
            <button type="button" className={paid ? "on" : ""} disabled={!canCharge} onClick={() => setPaid(true)}>{es ? "De pago" : "Paid"}</button>
          </div>
          {paid ? (
            <div className="cam-filters">
              {PRICES.map((value) => (
                <button key={value} type="button" className={price === value ? "on" : ""} onClick={() => setPrice(value)}>${value}</button>
              ))}
            </div>
          ) : null}
          <p>{es ? "Música del post. Las piezas de Tokkame son originales. Si subes otra, tiene que ser tuya." : "Music for the post. Tokkame pieces are original. If you upload another, it has to be yours."}</p>
          <div className="cam-filters">
            <button type="button" className={track === "" && !ownMusic ? "on" : ""} onClick={() => { setTrack(""); setOwnMusic(false); }}>{es ? "Sin música" : "No music"}</button>
            {TRACKS.map((item) => (
              <button key={item.id} type="button" className={track === item.id ? "on" : ""} onClick={() => { setTrack(item.id); setOwnMusic(false); }}>
                {es ? item.es : item.en}
              </button>
            ))}
          </div>
          <label className="cam-flip">{es ? "Subir música" : "Upload music"}
            <input type="file" accept="audio/mpeg,audio/wav,audio/mp4,audio/aac" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file || !audioRef.current) return;
              putFile(audioRef.current, file, file.name);
              setOwnMusic(true);
              setTrack("");
            }} />
          </label>
          {ownMusic ? (
            <label className="ig-check">
              <input name="musicOk" type="checkbox" required />
              {es ? "Esta música es mía o puedo usarla." : "This music is mine or I can use it."}
            </label>
          ) : null}
          <label>{es ? "Texto" : "Caption"}
            <textarea name="caption" required minLength={2} maxLength={500} placeholder={es ? "Qué está pasando" : "What is happening"} />
          </label>
          {!canCharge ? <p>{es ? "Cobrar se activa cuando la verificación queda aprobada. El post gratis sale ya." : "Charging turns on after verification. A free post can go out now."}</p> : null}
          <label className="ig-check">
            <input name="consent" type="checkbox" required />
            {es ? "Todas las personas son adultas y aceptaron salir." : "Everyone is an adult and agreed to be in this."}
          </label>
          <div className="cam-shutter-row">
            <button type="button" className="cam-flip" onClick={() => { setShot(""); setClipUrl(""); sharpRef.current = null; chunks.current = []; }}>{es ? "Otra" : "Retake"}</button>
            <button className="red-btn" type="submit" disabled={posting}>{posting ? (es ? "Publicando…" : "Posting…") : (es ? "Publicar" : "Post")}</button>
          </div>
        </form>
      )}
      {error ? <p className="ig-note">{error}</p> : null}
    </section>
  );
}
