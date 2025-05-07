# Elysia Remote DTS

A plugin that provides remote `.d.ts` types for Eden Treaty to consume.

[![NPM Version](https://img.shields.io/npm/v/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)
[![NPM Downloads](https://img.shields.io/npm/dw/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)
[![NPM License](https://img.shields.io/npm/l/elysia-remote-dts)](https://www.npmjs.com/package/elysia-remote-dts)

## Problem

Imagine this scenario: You've deployed an Elysia server remotely and want to provide end-to-end type safety using [Eden Treaty](https://elysiajs.com/eden/overview#eden-treaty-recommended). However, external developers don't have direct access to your server's source code to extract the `typeof app` types because:

- Your server is closed-source
- The frontend is located elsewhere, making types inaccessible

This plugin solves this problem by exposing types remotely and providing them to Eden Treaty for consumption.

> [!NOTE]  
> The code responsible for runtime type-generation is adapted from [rolldown-plugin-dts](https://github.com/sxzz/rolldown-plugin-dts). The difference is that our `generateDts` utility is completely independent and decoupled from the rolldown lifecycle. Full credit goes to the original developers - we've simply ported some functionality to enhance the Elysia ecosystem.

## Installation

```
bun add elysia-remote-dts
```

## Usage

```ts
import { Elysia } from 'elysia'
import { dts } from 'elysia-remote-dts'

const app = new Elysia().use(dts('./src/index.ts')).listen(3000)

// Be sure to export the type for the plugin to consume
export type App = typeof app;
```

Types will then be available at `/server.d.ts`.

Due to limitations with [Triple-Slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html), types cannot be directly consumed from a remote URL ([tracking issue](https://github.com/microsoft/TypeScript/issues/28985)). For frontend projects, you'll need to first download the type declaration file before using it with Eden:

```
curl -o server.ts https://<remote-url>/server.d.ts
```

Then use it in your frontend code:

```ts
import { treaty } from '@elysiajs/eden'
import type { App } from './server'

// Your frontend project should already have both elysia and @elysiajs/eden installed
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
| `dtsInput` | `boolean` | `false` | Set to `true` when entries are `.d.ts` files (instead of `.ts` files). When enabled, the plugin will skip generating a `.d.ts` file for the entry point. |
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

1. Type emission may occasionally return `null` in certain runtime environments (particularly in Distroless). We recommend using `oven/bun` or `oven/bun:alpine` as your base image.

2. The `typescript` package must be available at runtime, not just as a development dependency.

3. For all Elysia instances and controller chaining, it's recommended to chain your routes rather than calling `controller.<METHOD>` on separate lines, as the latter approach won't be properly included in type compilation by TypeScript. ([example](https://github.com/rayriffy/dts-chaining-repro/commit/fb4702ddc11a3973bf51eac753c18c1d606eae4b))
