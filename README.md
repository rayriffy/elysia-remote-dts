# Elysia remote DTS

A plugin that provide `.d.ts` types remotely for Eden Treaty to consume.

[![NPM Version](https://img.shields.io/npm/v/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)
[![NPM Downloads](https://img.shields.io/npm/dw/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)
[![NPM License](https://img.shields.io/npm/l/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)

Imagine in this scenario, you deploy an Elysia server remotely somewhere. And you also want to provide the benefit of end-to-end type safety by using [Eden Treaty](https://elysiajs.com/eden/overview#eden-treaty-recommended). But external developer may not have a direct access to source code to pull `typeof app` types out from your server maybe because.

- Your server is closed-source.
- Frontend locate somewhere else that make types inaccessible.

This plugin will attempt to expose types remotely, and provide remote type to Eden Treaty to consume somehow.

> [!NOTE]  
> Part of the code that responsible for runtime type-generation is copied from project [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts), what difference is this `generateDts` utility is completely dependent, and decoupled from rolldown lifecycle. Full credit should go to them, I just port some functionality that hoped to be cool stuff on Elysia ecosystem.

## Install

```
bun add elysia-remote-dts
```

## Usage

```ts
import { Elysia } from 'elysia'
import { dts } from 'elysia-remote-dts'

const app = new Elysia().use(dts('./src/index.ts')).listen(3000)

// Be sure to export type for plugin to consume as well.
export type App = typeof app;
```

Then types should be available at `/server.d.ts`.

Due to limitations with [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html), types cannot be directly consumed from a remote URL ([tracking issue](https://github.com/microsoft/TypeScript/issues/28985)). For frontend projects, you'll need to first download the type declaration file from this path before using it with Eden.

```
curl -o server.ts https://<remote-url>/server.d.ts
```

```ts
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

// frontend project should already have both elysia, and @elysiajs/eden installed
export const app = treaty<App>('https://<remote-url>')
```

## Configuration

The `dts` plugin accepts the following configuration options:

```ts
dts(entryPoint, options)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cwd` | `string` | Current directory | The directory where the plugin will look for the `tsconfig.json` file. |
| `dtsInput` | `boolean` | `false` | When entries are `.d.ts` files (instead of `.ts` files), this option should be set to `true`. If enabled, the plugin will skip generating a `.d.ts` file for the entry point. |
| `tsconfig` | `string \| boolean` | `"tsconfig.json"` | The path to the `tsconfig.json` file. When set to `false`, any `tsconfig.json` file will be ignored. |
| `compilerOptions` | `object` | `{}` | The `compilerOptions` for the TypeScript compiler. See [TypeScript compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html). |
| `resolve` | `boolean \| (string \| RegExp)[]` | `false` | Resolve external types used in `.d.ts` files from `node_modules`. Can be a boolean or an array of strings/RegExp patterns. |
| `resolvePaths` | `boolean` | `false` | When `true`, the plugin will resolve `paths` in `tsconfig.json`. This option is enabled automatically when `paths` is set in `compilerOptions`. |

### Example with Options

```ts
import { Elysia } from 'elysia'
import { dts } from 'elysia-remote-dts'

const app = new Elysia().use(
  dts('./src/index.ts', {
    tsconfig: './tsconfig.json',
    compilerOptions: {
      strict: true
    }
  })
).listen(3000)

export type App = typeof app;
```

## Known Limitations

1. Sometimes emitting types can be `null`, this happens only in some runtime environment (So far, Distroless). I would recommended `oven/bun`, or `oven/bun:alpine` as base image.
2. Be sure that `typescript` package is available when running. It's no longer `devDependencies`.
