// Loads a local .env into process.env (without overriding variables already set,
// e.g. from Vercel project settings). On Vercel the variables come from project settings.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const candidates = [
  path.join(process.cwd(), '.env'),
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env'),
]

for (const file of candidates) {
  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line)
    if (!match) continue
    const [, key, rawValue] = match
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2')
    if (process.env[key] === undefined || process.env[key] === '') process.env[key] = value
  }
  break
}

export const env = (key, fallback = '') => process.env[key] || fallback
