import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import Debug from 'debug'
import { filenameTsToDts } from './filename'
import { resolveOptions } from './resolveOptions'
import type { Options } from './types'

const debug = Debug('elysia-remote-dts:generateDts')
const execFileAsync = promisify(execFile)
const require = createRequire(import.meta.url)

export async function generateDts(
  filePath: string,
  options: Options = {}
): Promise<string> {
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const entry = path.resolve(cwd, filePath)
  if (options.dtsInput) {
    if (!/\.d\.[cm]?ts$/.test(entry)) {
      throw new Error(`Expected a declaration file for dtsInput: ${entry}`)
    }
    return readFile(entry, 'utf8')
  }

  const { tsconfig, compilerOptions } = resolveOptions(cwd, entry, options)
  const packageJson = require.resolve('typescript/package.json')
  const { bin } = require(packageJson) as { bin: { tsc: string } }
  const tsc = path.resolve(path.dirname(packageJson), bin.tsc)
  const tempDir = await mkdtemp(path.join(tmpdir(), 'elysia-remote-dts-'))

  try {
    const project = path.join(tempDir, 'tsconfig.json')
    const outDir = path.join(tempDir, 'out')
    await writeFile(
      project,
      JSON.stringify({
        // Inherit project-relative settings while compiling only the requested entry.
        extends: tsconfig,
        files: [entry],
        include: [],
        exclude: [],
        compilerOptions: {
          ...compilerOptions,
          declaration: true,
          declarationDir: null,
          declarationMap: false,
          emitDeclarationOnly: true,
          noEmit: false,
          noEmitOnError: false,
          noCheck: true,
          composite: false,
          incremental: false,
          tsBuildInfoFile: null,
          outDir,
        },
      })
    )

    debug('emitting declarations for %s with %s', entry, tsc)
    try {
      await execFileAsync(
        process.execPath,
        [tsc, '-p', project, '--pretty', 'false'],
        {
          cwd,
        }
      )
    } catch (error) {
      const { stdout, stderr } = error as { stdout?: string; stderr?: string }
      const details = [stdout?.trim(), stderr?.trim()]
        .filter(Boolean)
        .join('\n')
      throw new Error(
        `Error generating DTS for ${entry}: ${details || String(error)}`,
        {
          cause: error,
        }
      )
    }

    const declaration = filenameTsToDts(
      path.relative(compilerOptions.rootDir, entry)
    )
    return await readFile(path.join(outDir, declaration), 'utf8')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}
