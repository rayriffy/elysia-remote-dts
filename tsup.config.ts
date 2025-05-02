import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: true,
  external: ['elysia', 'debug', 'get-tsconfig', 'oxc-transform'],
})
