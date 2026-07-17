"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: {
      (options: Record<string, unknown>): unknown;
      presets: { apis: unknown };
    };
  }
}

export default function ApiDocsPage() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js";
    script.onload = () => {
      if (!window.SwaggerUIBundle) return;
      window.SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui",
        presets: [window.SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
        persistAuthorization: true,
        tryItOutEnabled: true,
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-[#e5eaf2] bg-[var(--brand-navy)] px-6 py-4 text-white">
        <h1 className="text-lg font-bold">EviMersin API Docs</h1>
        <p className="text-sm text-white/70">Swagger UI · Auth + Admin endpoints</p>
      </div>
      <div id="swagger-ui" />
    </main>
  );
}
