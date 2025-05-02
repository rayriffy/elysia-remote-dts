import Debug from 'debug'
import { isolatedDeclaration as oxcIsolatedDeclaration } from 'oxc-transform'
import path from 'node:path'
import { createOrGetTsModule, initTs, tscEmit } from './tsc'
import { filenameTsToDts } from './filename'
import { resolveOptions } from './resolveOptions'
import type { TsModule, DtsMap, Options } from './types'

const debug = Debug('elysia-remote-eden:generateDts')

/**
 * Generates DTS types for a TypeScript file and returns the content as a string
 * @param filePath Path to the TypeScript file to generate DTS for
 * @param options The options for DTS generation, same as the rolldown plugin
 * @returns The content of the generated .d.ts file as a string
 */
export async function generateDts(filePath: string, options: Options = {}): Promise<string> {
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
    let map: any
    
    if (resolved.isolatedDeclarations) {
      const result = oxcIsolatedDeclaration(absolutePath, code, resolved.isolatedDeclarations)
      if (result.errors.length) {
        const [error] = result.errors
        throw new Error(`Error generating DTS: ${error.message}\n${error.codeframe || ''}`)
      }
      dtsCode = result.code
    } else {
      // Initialize the TypeScript compiler if not using isolated declarations
      if (!resolved.isolatedDeclarations) {
        initTs()
      }
      
      // Create programs array for storing TypeScript programs
      const programs: any[] = []
      
      // Create or get TypeScript module
      const module = createOrGetTsModule(
        programs,
        resolved.compilerOptions,
        absolutePath,
        true,
        dtsMap,
      )
      
      // Emit TypeScript declarations
      const result = tscEmit(module)
      if (result.error) {
        throw new Error(`Error generating DTS: ${result.error}`)
      }
      dtsCode = result.code || ''
    }
    
    return dtsCode
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to generate DTS for ${filePath}: ${String(error)}`)
  }
} 