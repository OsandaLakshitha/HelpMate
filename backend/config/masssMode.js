// backend/config/masssMode.js

/**
 * Controls whether MASSS uses the local embedded RL server
 * or the deployed hosted MASSS RL API.
 *
 * Change MASSS_MODE in .env when MASSS is successfully hosted:
 *   MASSS_MODE=hosted
 *   MASSS_HOSTED_RL_URL=https://your-rl-service.railway.app
 */

const MASSS_MODE = process.env.MASSS_MODE || 'embedded'

const RL_URLS = {
  embedded: process.env.RL_SERVICE_URL    || 'http://localhost:8001',
  hosted:   process.env.MASSS_HOSTED_RL_URL,
}

const RL_BASE_URL = RL_URLS[MASSS_MODE]

if (!RL_BASE_URL) {
  console.warn(
    '[MASSS] Warning: MASSS_MODE is "hosted" but MASSS_HOSTED_RL_URL is not set. ' +
    'Falling back to embedded.'
  )
}

module.exports = {
  MASSS_MODE,
  RL_BASE_URL: RL_BASE_URL || RL_URLS.embedded,
  RL_SERVICE_KEY: process.env.RL_SERVICE_KEY || '',
}