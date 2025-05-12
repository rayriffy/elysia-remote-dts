import type { TsConfigJson } from 'get-tsconfig'

export interface Options {
  /**
   * The directory where the the plugin will look for the `tsconfig.json` file.
   */
  cwd?: string

  /**
   * When entries are `.d.ts` files (instead of `.ts` files), this option should be set to `true`.
   *
   * If enabled, the plugin will skip generating a `.d.ts` file for the entry point.
   */
  dtsInput?: boolean

  /**
   * The path to the `tsconfig.json` file.
   *
   * When set to `false`, the plugin will ignore any `tsconfig.json` file.
   * However, `compilerOptions` can still be specified directly in the options.
   *
   * @default `tsconfig.json`
   */
  tsconfig?: string | boolean

  /**
   * The `compilerOptions` for the TypeScript compiler.
   *
   * @see https://www.typescriptlang.org/docs/handbook/compiler-options.html
   */
  compilerOptions?: TsConfigJson.CompilerOptions

  /** Resolve external types used in dts files from `node_modules` */
  resolve?: boolean | (string | RegExp)[]

  /**
   * When `true`, the plugin will resolve `paths` in `tsconfig.json`.
   *
   * This option is enabled when `paths` is set in `compilerOptions`.
   */
  resolvePaths?: boolean

  /**
   * The path where the type definitions will be served.
   * 
   * @default `/server.d.ts`
   */
  dtsPath?: string
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type OptionsResolved = Overwrite<
  Required<Options>,
  {
    tsconfig: string | undefined
    isolatedDeclarations: false
    sourcemap: false
    emitDtsOnly: false
  }
>

export interface TsModule {
  /** `.ts` source code */
  code: string
  /** `.ts` file name */
  id: string
  isEntry: boolean
}

/** dts filename -> ts module */
export type DtsMap = Map<string, TsModule>
