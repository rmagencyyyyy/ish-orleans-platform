import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const registrationApiUrl =
    env.REGISTRATION_REQUEST_API_URL ||
    'https://api.nschool.app/api/v1/openapi/candidates/send-enrollment-link-by-email'
  const registrationApiToken = env.REGISTRATION_REQUEST_API_TOKEN

  return {
    plugins: [react()],
    server: registrationApiToken
      ? {
          proxy: {
            '/api/registration-request': {
              target: new URL(registrationApiUrl).origin,
              changeOrigin: true,
              headers: {
                'X-System-Token': registrationApiToken.trim(),
              },
              rewrite: () => new URL(registrationApiUrl).pathname,
            },
          },
        }
      : undefined,
  }
})
