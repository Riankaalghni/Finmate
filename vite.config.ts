import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'node:fs'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS === 'true' && repositoryName
  ? `/${repositoryName}/`
  : '/'

const hasLocalCertificates = fs.existsSync('./localhost-key.pem') && fs.existsSync('./localhost.pem')

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    ...(hasLocalCertificates ? {
      https: {
        key: fs.readFileSync('./localhost-key.pem'),
        cert: fs.readFileSync('./localhost.pem')
      }
    } : {})
  }
})
