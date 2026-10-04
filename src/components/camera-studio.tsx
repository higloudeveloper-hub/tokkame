"use client";

import { useEffect, useRef, useState } from "react";
import { createPost } from "@/lib/actions";
import { FILTERS, RETOS, TRACKS } from "@/lib/kit";

export function CameraStudio({ canCharge, lang, reto = "" }: { canCharge: boolean; lang: "en" | "es"; reto?: string }) {
  const es = lang === "es";
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("normal");
  const [shot, setShot] = useState("");
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");
  const css = FILTERS.find((item) => item.id === filter)?.css || "none";

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError(es ? "La cámara no dio permiso. Puedes elegir una foto." : "The camera did not allow access. You can choose a photo.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError(es ? "Abre la cámara primero." : "Open the camera first.");
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
    canvas.toBlob((blob) => {
      if (!blob || !fileRef.current) return;
      const file = new File([blob], "tokkame.jpg", { type: "image/jpeg" });
      const data = new DataTransfer();
      data.items.add(file);
      fileRef.current.files = data.files;
      setShot(URL.createObjectURL(blob));
    }, "image/jpeg", 0.86);
  }

  return (
    <section className="ig-cam">
      <p className="ig-kicker">{es ? "Crear en Tokkame" : "Create in Tokkame"}</p>
      <h1>{es ? "Cámara, filtro, música, reto." : "Camera, filter, music, challenge."}</h1>
      <div className="ig-view">
        {shot ? <img src={shot} alt="" /> : <video ref={videoRef} playsInline muted autoPlay style={{ filter: css }} />}
      </div>
      <div className="ig-filters">
        {FILTERS.map((item) => (
          <button key={item.id} type="button" className={filter === item.id ? "on" : ""} onClick={() => setFilter(item.id)}>
            {es ? item.es : item.en}
          </button>
        ))}
      </div>
      <div className="ig-cam-actions">
        <button type="button" onClick={start}>{es ? "Abrir cámara" : "Open camera"}</button>
        <button type="button" onClick={capture}>{es ? "Tomar foto" : "Take photo"}</button>
      </div>
      {error ? <p className="ig-note">{error}</p> : null}
      <form action={createPost} className="ig-form">
        <input ref={fileRef} name="file" type="file" accept="image/jpeg,image/png,image/webp" />
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="format" value="foto" />
        <input type="hidden" name="back" value="/" />
        <label>{es ? "Texto" : "Caption"}
          <textarea name="caption" required minLength={2} maxLength={500} placeholder={es ? "Qué está pasando" : "What is happening"} />
        </label>
        <label>{es ? "Música" : "Music"}
          <select name="track" defaultValue={TRACKS[0].id}>
            {TRACKS.map((track) => <option key={track.id} value={track.id}>{es ? track.es : track.en}</option>)}
          </select>
        </label>
        <label>{es ? "Reto" : "Challenge"}
          <select name="challenge" defaultValue={RETOS.some((item) => item.id === reto) ? reto : ""}>
            <option value="">{es ? "Sin reto" : "No challenge"}</option>
            {RETOS.map((reto) => <option key={reto.id} value={reto.id}>{es ? reto.es : reto.en}</option>)}
          </select>
        </label>
        <label className="ig-check">
          <input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} disabled={!canCharge} />
          {es ? "Post de pago" : "Paid post"}
        </label>
        {paid ? <input name="price" type="number" min={1} max={200} defaultValue={5} /> : null}
        <input type="hidden" name="visibility" value={paid ? "ppv" : "public"} />
        <label className="ig-check">
          <input name="consent" type="checkbox" required />
          {es ? "Todas las personas son adultas y aceptaron salir." : "Everyone is an adult and agreed to be in this."}
        </label>
        <button className="red-btn" type="submit">{es ? "Publicar en mi feed" : "Post to my feed"}</button>
        {!canCharge ? <p className="ig-note">{es ? "El post gratis sale ya. Para cobrar, la verificación tiene que estar aprobada. Te quedas con el 80%." : "A free post goes out now. Charging waits until verification is approved. You keep 80%."}</p> : <p className="ig-note">{es ? "El post de pago se ve borroso. Quien pague lo abre con saldo de prueba. Te quedas con el 80%." : "A paid post stays blurred. Whoever pays opens it with sandbox balance. You keep 80%."}</p>}
      </form>
    </section>
  );
}
