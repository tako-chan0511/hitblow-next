// src/app/head.tsx
export default function Head() {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH || ".";
  const baseHref = raw.endsWith("/") ? raw : raw + "/";
  return (
    <>
      <base href={baseHref} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            const t = localStorage.getItem('theme')
            if (t) document.documentElement.setAttribute('data-theme', t)
          })()`,
        }}
      />
    </>
  );
}
