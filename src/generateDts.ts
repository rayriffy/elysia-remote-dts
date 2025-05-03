import path from 'node:path'
import Debug from 'debug'
import type Ts from 'typescript'
import { filenameTsToDts } from './filename'
import { resolveOptions } from './resolveOptions'
import { createOrGetTsModule, initTs, tscEmit } from './tsc'
import type { DtsMap, Options, TsModule } from './types'

const debug = Debug('elysia-remote-dts:generateDts')

/**
 * Generates DTS types for a TypeScript file and returns the content as a string
 * @param filePath Path to the TypeScript file to generate DTS for
 * @param options The options for DTS generation, same as the rolldown plugin
 * @returns The content of the generated .d.ts file as a string
 */
export async function generateDts(
  filePath: string,
  options: Options = {}
): Promise<string> {
  debug('resolving dts options')
  const resolved = resolveOptions(options)
  debug('resolved dts options %o', resolved)

  // Ensure the path is absolute
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(resolved.cwd, filePath)

  // Create a DTS map to store TypeScript modules
  const dtsMap: DtsMap = new Map<string, TsModule>()

  // Read the file content
  try {
    const fs = await import('node:fs/promises')
    const code = await fs.readFile(absolutePath, 'utf-8')

    // Add the file to the DTS map
    const dtsId = filenameTsToDts(absolutePath)
    dtsMap.set(dtsId, { code, id: absolutePath, isEntry: true })

    // Generate DTS content
    let dtsCode = ''

    // Initialize the TypeScript compiler
    initTs()

    // Create programs array for storing TypeScript programs
    const programs: Ts.Program[] = []

    // Create or get TypeScript module
    const module = createOrGetTsModule(
      programs,
      resolved.compilerOptions,
      absolutePath,
      true,
      dtsMap
    )

    // Emit TypeScript declarations
    const result = tscEmit(module)
    if (result.error) {
      throw new Error(`Error generating DTS: ${result.error}`)
    }
    dtsCode = result.code || ''

    return dtsCode
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to generate DTS for ${filePath}: ${String(error)}`)
  }
}
