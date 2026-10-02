import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const jobs = [
  ["public/look/hero.jpg", "public/look/hero.mp4"],
  ["public/look/c1.jpg", "public/look/v1.mp4"],
  ["public/look/c2.jpg", "public/look/v2.mp4"],
  ["public/look/c3.jpg", "public/look/v3.mp4"],
  ["public/look/c4.jpg", "public/look/v4.mp4"],
  ["public/look/c5.jpg", "public/look/v5.mp4"],
  ["public/look/c6.jpg", "public/look/v6.mp4"],
];

const vf =
  "scale=2560:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=2560:1440,zoompan=z='1+0.00035*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=1280x720:fps=30";

for (const [input, output] of jobs) {
  const result = spawnSync(
    ffmpeg,
    [
      "-y",
      "-loop",
      "1",
      "-i",
      input,
      "-vf",
      vf,
      "-frames:v",
      "90",
      "-an",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "veryfast",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
