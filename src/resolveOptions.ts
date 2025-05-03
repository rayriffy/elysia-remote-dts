import path from 'node:path'
import { getTsconfig, parseTsconfig } from 'get-tsconfig'
import type { Options, OptionsResolved } from './types'

export function resolveOptions({
  cwd = process.cwd(),
  tsconfig,
  compilerOptions = {},
  sourcemap,
  dtsInput = false,
  emitDtsOnly = false,
  resolve = false,
  resolvePaths,
}: Options): OptionsResolved {
  if (tsconfig === true || tsconfig == null) {
    const { config, path } = getTsconfig(cwd) || {}
    tsconfig = path
    compilerOptions = {
      ...config?.compilerOptions,
      ...compilerOptions,
    }
  } else if (typeof tsconfig === 'string') {
    tsconfig = path.resolve(cwd || process.cwd(), tsconfig)
    const config = parseTsconfig(tsconfig)
    compilerOptions = {
      ...config.compilerOptions,
      ...compilerOptions,
    }
  } else {
    tsconfig = undefined
  }

  sourcemap ??= !!compilerOptions.declarationMap
  compilerOptions.declarationMap = sourcemap

  return {
    cwd,
    tsconfig: typeof tsconfig === 'boolean' ? undefined : tsconfig,
    compilerOptions,
    isolatedDeclarations: false,
    sourcemap,
    dtsInput,
    emitDtsOnly,
    resolve,
    resolvePaths: resolvePaths ?? !!compilerOptions?.paths,
  }
}
