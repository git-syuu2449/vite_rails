import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import vue from  '@vitejs/plugin-vue'
import path from 'path'
// import tailwindcss from "@tailwindcss/vite"; // v4用

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3036,
    strictPort: true,
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, 'app/frontend/js'),
      '@components': path.resolve(__dirname, 'app/frontend/js/components'),
      '@css': path.resolve(__dirname, 'app/frontend/css'),
    },
  },
  plugins: [
    RubyPlugin(),
    vue(),
    // tailwindcss() // v4用
  ],
})
