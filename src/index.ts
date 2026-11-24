import { Elysia } from 'elysia'
import { generateDts } from './generateDts'
import type { Options } from './types'

type DeclarationRoutes = Record<
  string,
  {
    get: {
      body: unknown
      params: Record<never, never>
      query: unknown
      headers: unknown
      response: { 200: string }
    }
  }
>

// Use the consuming app's Elysia defaults in the public plugin type.
type DeclarationPlugin<App = Elysia> = App extends Elysia<
  infer BasePath,
  infer Singleton,
  infer Definitions,
  infer Metadata,
  infer Routes,
  infer Ephemeral,
  infer Volatile
>
  ? Elysia<
      BasePath,
      Singleton,
      Definitions,
      Metadata,
      Routes & DeclarationRoutes,
      Ephemeral,
      Volatile
    >
  : never

export const dts = (filePath: string, options?: Options): DeclarationPlugin => {
  let dts = ''
  const dtsPath = options?.dtsPath || '/server.d.ts'

  return new Elysia()
    .onStart(async () => {
      dts = await generateDts(filePath, options)
    })
    .get(dtsPath, ({ set }) => {
      // use same Content-Type as Deno
      // https://github.com/denoland/deno/blob/f42cb0816ef3be41213c0b2151b1d1c28495d4ce/cli/lsp/documents.rs#L1712
      set.headers['Content-Type'] = 'application/typescript'
      return dts
    })
}

export type { Options }
