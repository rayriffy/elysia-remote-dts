import { Elysia } from 'elysia'
import type { Options } from "./types";
import { generateDts } from './generateDts';

export const dts = (filePath: string, options: Options) => {
  let dts: string = ''

  return new Elysia()
    .onStart(async () => {
      dts = await generateDts(filePath, options)
    })
    .get('/server.d.ts', () => dts)
}
