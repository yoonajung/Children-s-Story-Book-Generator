// vite.config.ts
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react()],
    define: {
      // 클라이언트로 노출됨 → 민감 키는 사용 ❌ (백엔드 함수로 요청)
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
    }
  }
})
