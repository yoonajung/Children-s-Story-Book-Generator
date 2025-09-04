import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Children-s-Story-Book-Generator/', // 리포 이름 그대로
})
