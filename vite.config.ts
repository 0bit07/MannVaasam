import { copyFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// `vercel dev` rewrites client routes to `/index.html` before Vite sees them.
// Vite then runs that URL through the JS import pipeline and throws. Serve it
// as the SPA document instead.
function undoIndexHtmlRewrite(): Plugin {
  return {
    name: "undo-index-html-rewrite",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/index.html" || req.url?.startsWith("/index.html?")) {
          req.url = req.url.replace(/^\/index\.html/, "/") || "/"
        }
        next()
      })
    },
  }
}

function copyIndexTo404(): Plugin {
  return {
    name: "copy-index-to-404",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(rootDir, "dist")
      copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"))
    },
  }
}

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [undoIndexHtmlRewrite(), react(), tailwindcss(), copyIndexTo404()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    strictPort: Boolean(process.env.PORT),
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
    strictPort: Boolean(process.env.PORT),
  },
})
