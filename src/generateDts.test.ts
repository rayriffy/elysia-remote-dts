import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { generateDts } from './generateDts'

let cwd: string

beforeEach(async () => {
  cwd = await mkdtemp(path.join(tmpdir(), 'elysia remote dts test-'))
})

afterEach(async () => {
  await rm(cwd, { force: true, recursive: true })
})

it('emits the requested entry using TypeScript 7 and its project config', async () => {
  await mkdir(path.join(cwd, 'node_modules', 'app-globals'), {
    recursive: true,
  })
  await writeFile(
    path.join(cwd, 'node_modules', 'app-globals', 'index.d.ts'),
    'declare const port: 3000\n'
  )
  await writeFile(
    path.join(cwd, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        noEmit: true,
        incremental: true,
        tsBuildInfoFile: './build.tsbuildinfo',
        declarationDir: './declarations',
        rootDir: '.',
        types: ['app-globals'],
        paths: { '#port': ['./port.mts'] },
      },
      files: ['unused.ts'],
    })
  )
  await writeFile(path.join(cwd, 'port.mts'), 'export const serverPort = port')
  await writeFile(
    path.join(cwd, 'index.mts'),
    "import { serverPort } from '#port'\nexport const config = { serverPort }"
  )

  const result = await generateDts('index.mts', { cwd })

  expect(result).toContain('serverPort: 3000')
  expect((await readdir(cwd)).sort()).toEqual([
    'index.mts',
    'node_modules',
    'port.mts',
    'tsconfig.json',
  ])
})

it('includes compiler diagnostics when declaration generation fails', async () => {
  await expect(
    generateDts('missing.ts', { cwd, tsconfig: false })
  ).rejects.toThrow(/Error generating DTS[\s\S]*error TS6053/)
})

it('serves existing declarations with dtsInput', async () => {
  const declarations = 'export declare const value: string\n'
  await writeFile(path.join(cwd, 'index.d.ts'), declarations)

  await expect(
    generateDts('index.d.ts', { cwd, dtsInput: true })
  ).resolves.toBe(declarations)
  await expect(
    generateDts('index.ts', { cwd, dtsInput: true })
  ).rejects.toThrow('Expected a declaration file')
})
