import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://func-student-schedule-gbcpezaghachdkfn.eastasia-01.azurewebsites.net',
        changeOrigin: true,
      }
    }
  }
})
