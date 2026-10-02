"use client";

import { useState } from "react";

export function CopyButton({ path, label }: { path: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn ghost small"
      onClick={async () => {
        const text = `${window.location.origin}${path}`;
        await navigator.clipboard.writeText(text);
        setDone(true);
      }}
    >
      {done ? "Copiado" : label}
    </button>
  );
}
