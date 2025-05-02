# Elysia remote DTS

A plugin that provide `.d.ts` types remotely for Eden Treaty to consume.

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

new Elysia().use(dts('./src/index.ts')).listen(3000)
```

Then types should be available at `/server.d.ts`

## Configuration

To be documented
