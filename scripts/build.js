require('esbuild').buildSync({
    entryPoints: ['./base/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['chrome58'],
    outdir: 'dist',
  })