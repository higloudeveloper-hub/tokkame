import { VideoRail } from "@/components/video-rail";
import { CLIPS } from "@/lib/studio";

export default function VideosPage() {
  return (
    <div className="videos-page">
      <div className="section-head" style={{ marginTop: 0 }}>
        <h2>Videos</h2>
      </div>
      <p className="lead" style={{ marginTop: 0 }}>
        Previews play on hover. Open one to watch it here, then subscribe for the private cut.
      </p>
      <VideoRail clips={CLIPS} layout="grid" showHeading={false} />
    </div>
  );
}
