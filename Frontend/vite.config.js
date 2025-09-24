// קובץ הגדרות Vite עבור הפרויקט Frontend
// מגדיר את הגדרות השרת, פורט ופרוקסי עבור פיתוח
// מכיל את כל ההגדרות הנדרשים להרצת סביבת הפיתוח
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
