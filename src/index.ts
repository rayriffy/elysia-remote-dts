import { Elysia } from 'elysia'
import { generateDts } from './generateDts'
import type { Options } from './types'

export const dts = (filePath: string, options?: Options) => {
  let dts = ''

  return new Elysia()
    .onStart(async () => {
      dts = await generateDts(filePath, options)
    })
    .get('/server.d.ts', ({ set }) => {
      // use same Content-Type as Deno
      // https://github.com/denoland/deno/blob/f42cb0816ef3be41213c0b2151b1d1c28495d4ce/cli/lsp/documents.rs#L1712
      set.headers['Content-Type'] = 'application/typescript'
      return dts
    })
}
