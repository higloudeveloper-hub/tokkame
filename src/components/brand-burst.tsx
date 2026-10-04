"use client";

export function BrandBurst({ on, screen = false }: { on: boolean; screen?: boolean }) {
  if (!on) return null;
  return (
    <div className={`brand-burst${screen ? " is-screen" : ""}`} aria-hidden>
      <b>tokkame.com</b>
    </div>
  );
}
