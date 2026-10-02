import { VideoRail } from "@/components/video-rail";
import { getLang } from "@/lib/lang";
import { CLIPS } from "@/lib/studio";

export default async function VideosPage() {
  const lang = await getLang();
  return (
    <div className="videos-page">
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2>Videos</h2>
      </div>
      <p className="lead" style={{ marginTop: 0 }}>
        {lang === "es"
          ? "Las vistas previas se reproducen al pasar el cursor. Abre una para verla aquí y suscríbete para el corte privado."
          : "Previews play on hover. Open one to watch it here, then subscribe for the private cut."}
      </p>
      <VideoRail clips={CLIPS} layout="grid" showHeading={false} lang={lang} />
    </div>
  );
}
