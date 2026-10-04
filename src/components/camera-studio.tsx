"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type PointerEvent } from "react";
import { createPost } from "@/lib/actions";
import { FILTERS, TRACKS } from "@/lib/kit";

const STAMPS = [
  { id: "ahora", es: "Ahora", en: "Right now" },
  { id: "noche", es: "Esta noche", en: "Tonight" },
  { id: "mira", es: "Mira", en: "Look" },
  { id: "solo", es: "Solo esto", en: "Only this" },
] as const;

const PRICES = [3, 5, 9, 15];

function blobOf(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
}

function putFile(input: HTMLInputElement, blob: Blob, name: string) {
  const data = new DataTransfer();
  data.items.add(new File([blob], name, { type: "image/jpeg" }));
  input.files = data.files;
}

export function CameraStudio({ canCharge, lang }: { canCharge: boolean; lang: "en" | "es" }) {
  const es = lang === "es";
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sharpRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fullRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("normal");
  const [shot, setShot] = useState("");
  const [curtain, setCurtain] = useState(58);
  const [stamp, setStamp] = useState("");
  const [price, setPrice] = useState(5);
  const [error, setError] = useState("");
  const css = FILTERS.find((item) => item.id === filter)?.css || "none";
  const paid = canCharge && curtain < 96;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let gone = false;
    if (!shot) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: facing }, audio: false })
        .then(async (next) => {
          if (gone) {
            next.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = next;
          if (videoRef.current) {
            videoRef.current.srcObject = next;
            await videoRef.current.play();
          }
        })
        .catch(() => setError(es ? "La cámara no dio permiso. Elige una foto abajo." : "The camera did not allow access. Choose a photo below."));
    }
    return () => {
      gone = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [facing, shot, es]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError(es ? "Espera a que la cámara abra." : "Wait for the camera to open.");
      return;
    }
    const scale = Math.min(1, 1080 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = css;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    sharpRef.current = canvas;
    setShot(canvas.toDataURL("image/jpeg", 0.8));
    setError("");
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1080 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = css;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      sharpRef.current = canvas;
      setShot(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!paid && !canCharge) return;
    if (!canCharge || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    setCurtain(Math.round(Math.min(0.9, Math.max(0.2, ratio)) * 100));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (sending.current) return;
    event.preventDefault();
    const sharp = sharpRef.current;
    if (!sharp || !fileRef.current || !fullRef.current || !formRef.current) {
      setError(es ? "Toma la foto primero." : "Take the photo first.");
      return;
    }
    if (stamp) {
      const mark = sharp.getContext("2d");
      if (mark) {
        mark.filter = "none";
        mark.fillStyle = "white";
        mark.font = `800 ${Math.round(sharp.width * 0.075)}px sans-serif`;
        mark.fillText(stamp, 28, 64);
      }
    }
    const cover = document.createElement("canvas");
    cover.width = sharp.width;
    cover.height = sharp.height;
    const ctx = cover.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(sharp, 0, 0);
    if (paid) {
      const y = Math.round((cover.height * curtain) / 100);
      const slice = document.createElement("canvas");
      slice.width = cover.width;
      slice.height = Math.max(1, cover.height - y);
      const cut = slice.getContext("2d");
      if (cut) {
        cut.drawImage(cover, 0, y, cover.width, slice.height, 0, 0, cover.width, slice.height);
        ctx.filter = "blur(18px)";
        ctx.drawImage(slice, 0, y);
        ctx.filter = "none";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillRect(0, y - 2, cover.width, 4);
      }
    }
    const coverBlob = await blobOf(cover);
    const fullBlob = paid ? await blobOf(sharp) : null;
    if (!coverBlob) return;
    putFile(fileRef.current, coverBlob, "cover.jpg");
    if (fullBlob) putFile(fullRef.current, fullBlob, "full.jpg");
    sending.current = true;
    formRef.current.requestSubmit();
  }

  return (
    <section className="cam-app">
      <div
        ref={stageRef}
        className="cam-stage"
        onPointerDown={shot && canCharge ? drag : undefined}
        onPointerMove={(event) => {
          if (event.buttons === 1 && shot && canCharge) drag(event);
        }}
      >
        {shot ? <img src={shot} alt="" /> : <video ref={videoRef} playsInline muted autoPlay style={{ filter: css }} />}
        {stamp ? <b className="cam-stamp">{stamp}</b> : null}
        {shot && canCharge ? (
          <>
            <div className="cam-veil" style={{ height: `${100 - curtain}%` }} />
            <div className="cam-line" style={{ top: `${curtain}%` }}>
              <span>{paid ? (es ? `Debajo se paga · $${price}` : `Below this is paid · $${price}`) : (es ? "Todo se ve" : "All of it shows")}</span>
            </div>
          </>
        ) : null}
      </div>

      {!shot ? (
        <>
          <div className="cam-filters">
            {FILTERS.map((item) => (
              <button key={item.id} type="button" className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
                {es ? item.es : item.en}
              </button>
            ))}
          </div>
          <div className="cam-shutter-row">
            <button type="button" className="cam-flip" onClick={() => setFacing((value) => (value === "user" ? "environment" : "user"))}>{es ? "Girar" : "Flip"}</button>
            <button type="button" className="cam-shutter" onClick={capture} aria-label={es ? "Tomar foto" : "Take photo"} />
            <label className="cam-flip">
              {es ? "Foto" : "Photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
            </label>
          </div>
        </>
      ) : (
        <form ref={formRef} action={createPost} className="cam-dock" onSubmit={onSubmit}>
          <input ref={fileRef} name="file" type="file" accept="image/jpeg" hidden />
          <input ref={fullRef} name="full" type="file" accept="image/jpeg" hidden />
          <input type="hidden" name="filter" value={filter} />
          <input type="hidden" name="format" value="foto" />
          <input type="hidden" name="back" value="/" />
          <input type="hidden" name="curtain" value={paid ? curtain : 100} />
          <input type="hidden" name="visibility" value={paid ? "ppv" : "public"} />
          <input type="hidden" name="price" value={paid ? price : 0} />
          <p>{es ? "Baja la línea. Arriba se ve. Debajo se cobra." : "Drag the line. Above shows. Below is paid."}</p>
          <div className="cam-filters">
            {STAMPS.map((item) => {
              const label = es ? item.es : item.en;
              return (
                <button key={item.id} type="button" className={stamp === label ? "on" : ""} onClick={() => setStamp((value) => (value === label ? "" : label))}>
                  {label}
                </button>
              );
            })}
          </div>
          <label>{es ? "Texto" : "Caption"}
            <textarea name="caption" required minLength={2} maxLength={500} placeholder={es ? "Qué está pasando" : "What is happening"} />
          </label>
          <div className="cam-filters">
            {TRACKS.map((track) => (
              <label key={track.id} className="cam-pick">
                <input type="radio" name="track" value={track.id} defaultChecked={track.id === TRACKS[0].id} />
                {es ? track.es : track.en}
              </label>
            ))}
          </div>
          {canCharge ? (
            <div className="cam-filters">
              {PRICES.map((value) => (
                <button key={value} type="button" className={price === value ? "on" : ""} onClick={() => setPrice(value)}>${value}</button>
              ))}
            </div>
          ) : <p>{es ? "Para cobrar con la línea, la verificación tiene que estar aprobada." : "Dropping the line to charge waits until verification is approved."}</p>}
          <label className="ig-check">
            <input name="consent" type="checkbox" required />
            {es ? "Todas las personas son adultas y aceptaron salir." : "Everyone is an adult and agreed to be in this."}
          </label>
          <div className="cam-shutter-row">
            <button type="button" className="cam-flip" onClick={() => { setShot(""); sharpRef.current = null; }}>{es ? "Otra" : "Retake"}</button>
            <button className="red-btn" type="submit">{es ? "Publicar" : "Post"}</button>
          </div>
        </form>
      )}
      {error ? <p className="ig-note">{error}</p> : null}
    </section>
  );
}
