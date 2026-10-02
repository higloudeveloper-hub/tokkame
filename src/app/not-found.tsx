import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel">
      <h1 className="display">Ese perfil no está</h1>
      <Link className="btn" href="/discover">Volver a Discover</Link>
    </div>
  );
}
