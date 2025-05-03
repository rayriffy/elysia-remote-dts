import { Elysia, t } from 'elysia'
import { dts } from 'elysia-remote-dts'

const app = new Elysia()
  .use(dts('./src/index.ts'))
  .get('/', () => 'Hello Elysia')
  .post(
    '/cow',
    ({ body }) => {
      return body.message
    },
    {
      body: t.Object({
        message: t.String(),
      }),
    }
  )
  .listen(3000)

export type App = typeof app

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
)
