import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 在 production（gh-pages 部署）時使用 repo 名稱當作 base；本機開發用根目錄。
// 若日後 repo 改名，再修改 '/scheduler-test/'
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/scheduler-test/' : '/',
});
