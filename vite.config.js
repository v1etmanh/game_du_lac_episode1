import { defineConfig, loadEnv, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function createNodeResponse(res) {
  return {
    setHeader(key, value) {
      res.setHeader(key, value)
    },
    status(code) {
      res.statusCode = code
      return this
    },
    json(payload) {
      if (!res.hasHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      res.end(JSON.stringify(payload))
      return this
    },
    end(payload) {
      res.end(payload)
      return this
    },
  }
}

function localApiPlugin() {
  return {
    name: 'local-serverless-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url, 'http://localhost')
        if (pathname !== '/api/interview-turn' && pathname !== '/api/health') {
          return next()
        }

        try {
          const modulePath = pathname === '/api/interview-turn'
            ? './api/interview-turn.js'
            : './api/health.js'
          const { default: handler } = await import(modulePath)
          req.body = await readJsonBody(req)
          return handler(req, createNodeResponse(res))
        } catch (err) {
          console.error(`[local-api] ${pathname} failed`, err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify({ error: 'Local API failed' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      localApiPlugin(),
      {
        name: 'giai-do-jsx-loader',
        async transform(code, id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (!normalizedId.includes('/src/giai_do/src/') || !normalizedId.endsWith('.js')) {
            return null
          }

          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          })
        },
      },
      react(),
    ],
    server: {
      port: 5173,
    },
  }
})
