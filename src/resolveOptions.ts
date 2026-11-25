import path from 'node:path'
import { getTsconfig, parseTsconfig } from 'get-tsconfig'
import type { Options } from './types'

export function resolveOptions(
  cwd: string,
  entry: string,
  { tsconfig, compilerOptions: overrides = {} }: Options
) {
  let project: ReturnType<typeof getTsconfig> = null
  if (typeof tsconfig === 'string') {
    const configPath = path.resolve(cwd, tsconfig)
    project = { path: configPath, config: parseTsconfig(configPath) }
  } else if (tsconfig !== false) {
    project = getTsconfig(cwd)
  }

  const configDir = project ? path.dirname(project.path) : cwd
  const inherited = project?.config.compilerOptions
  const rootDir = overrides.rootDir
    ? path.resolve(cwd, overrides.rootDir)
    : inherited?.rootDir
      ? path.resolve(configDir, inherited.rootDir)
      : path.parse(entry).root

  return {
    tsconfig: project?.path,
    compilerOptions: {
      target: inherited?.target ?? 'esnext',
      skipLibCheck: inherited?.skipLibCheck ?? true,
      preserveSymlinks: inherited?.preserveSymlinks ?? true,
      resolveJsonModule: inherited?.resolveJsonModule ?? true,
      ...overrides,
      rootDir,
      rootDirs: overrides.rootDirs?.map(dir => path.resolve(cwd, dir)),
      paths:
        overrides.paths &&
        Object.fromEntries(
          Object.entries(overrides.paths).map(([pattern, targets]) => [
            pattern,
            targets.map(target => path.resolve(cwd, target)),
          ])
        ),
      typeRoots:
        overrides.typeRoots?.map(dir => path.resolve(cwd, dir)) ??
        (!inherited?.typeRoots && (overrides.types ?? inherited?.types)?.length
          ? getTypeRoots(configDir)
          : undefined),
    },
  }
}

// A temporary tsconfig is outside the project's node_modules search path.
function getTypeRoots(configDir: string): string[] {
  const typeRoots: string[] = []
  let dir = configDir
  while (true) {
    typeRoots.push(
      path.join(dir, 'node_modules', '@types'),
      path.join(dir, 'node_modules')
    )
    const parent = path.dirname(dir)
    if (parent === dir) return typeRoots
    dir = parent
  }
}
