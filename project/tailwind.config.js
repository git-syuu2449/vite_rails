import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  
    content: [
    './app/views/**/*.{html,erb,haml,slim}',                // Rails のビューファイル
    './app/helpers/**/*.rb',                                // helper 内でHTMLタグを返すことがある場合
    './app/frontend/js/**/*.{js,ts,jsx,tsx,vue}',           // Viteで読み込むフロントエンドコード
    './app/frontend/css/**/*.{css,sass}',                   // Viteで読み込むフロントエンドコード
    './app/components/**/*.{erb,html,rb}',                  // ViewComponent
  ],
  
  theme: {
    extend: {
        fontFamily: {
            sans: ['Figtree', ...defaultTheme.fontFamily.sans],
        },
    },
  },

  plugins: [forms],
}
