import type { NextConfig } from 'next';

const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  // Cloudflare sirve `out/` como assets estáticos. Docker sigue usando standalone.
  output: staticExport ? 'export' : 'standalone',
  // Durante el export, `app/api` se aparta (POST no es exportable) y el
  // typecheck del build no encuentra esa ruta. `tsc` en CI sí la revisa.
  typescript: { ignoreBuildErrors: staticExport },
  images: staticExport
    ? { unoptimized: true }
    : {
        formats: ['image/avif', 'image/webp'],
        qualities: [50, 55, 60, 75],
      },
};

export default nextConfig;
