import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      // Map react-native → react-native-web
      'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
      // Stub native-only modules
      'react-native-linear-gradient': path.resolve(__dirname, 'web/stubs/LinearGradient.js'),
      'react-native-vector-icons/FontAwesome5': path.resolve(__dirname, 'web/stubs/Icon.js'),
      '@react-native-vector-icons/fontawesome5': path.resolve(__dirname, 'web/stubs/Icon.js'),
      // SVG passthrough (react-native-svg-web or stub)
      'react-native-svg': path.resolve(__dirname, 'web/stubs/Svg.js'),
    },
  },
  optimizeDeps: {
    include: ['react-native-web'],
    rolldownOptions: {
      plugins: [],
    },
  },
  build: {
    outDir: '../web-build',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
