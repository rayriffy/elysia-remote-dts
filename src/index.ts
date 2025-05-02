import { Elysia } from 'elysia'
import { generateDts } from './generateDts'
import type { Options } from './types'

export const dts = (filePath: string, options?: Options) => {
  let dts = ''

  return new Elysia()
    .onStart(async () => {
      dts = await generateDts(filePath, options)
    })
    .get('/server.d.ts', () => dts)
}
