import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';

const manifest = JSON.parse(fs.readFileSync('./src/manifest.json', 'utf-8'));

// Custom plugin to handle version replacement
function versionReplacePlugin() {
  return {
    name: 'version-replace',
    generateBundle() {
      // This will be handled in the build hook
    },
    writeBundle(options, bundle) {
      const outputDir = options.dir;
      // Replace version placeholders in HTML files
      const htmlFiles = Object.keys(bundle).filter(file => file.endsWith('.html'));
      
      htmlFiles.forEach(file => {
        const filePath = resolve(outputDir, file);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf-8');
          content = content.replace(/__IMMERSIVE_TRANSLATE_VERSION__/g, manifest.version);
          fs.writeFileSync(filePath, content);
        }
      });
    }
  };
}

// Custom plugin to create zip files
function zipPlugin(filename) {
  return {
    name: 'zip-plugin',
    writeBundle(options) {
      const outputDir = options.dir;
      const output = fs.createWriteStream(resolve('dist', `${filename}.zip`));
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      archive.directory(outputDir, false);
      archive.finalize();
    }
  };
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist/default',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Background scripts
        background: resolve(__dirname, 'src/background/background.js'),
        
        // Content scripts
        pageTranslator: resolve(__dirname, 'src/contentScript/pageTranslator.js'),
        enhance: resolve(__dirname, 'src/contentScript/enhance.js'),
        showOriginal: resolve(__dirname, 'src/contentScript/showOriginal.js'),
        popupMobile: resolve(__dirname, 'src/contentScript/popupMobile.js'),
        checkScriptIsInjected: resolve(__dirname, 'src/contentScript/checkScriptIsInjected.js'),
        
        // Popup pages
        oldPopup: resolve(__dirname, 'src/popup/old-popup.html'),
        popupTranslateDocument: resolve(__dirname, 'src/popup/popup-translate-document.html'),
        
        // Options page
        options: resolve(__dirname, 'src/options/options.html'),
        
        // Detect PDF script
        detectPdf: resolve(__dirname, 'src/popup/detect-pdf.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId?.includes('background/')) return 'background/[name].js';
          if (facadeModuleId?.includes('contentScript/')) return 'contentScript/[name].js';
          if (facadeModuleId?.includes('popup/')) return 'popup/[name].js';
          if (facadeModuleId?.includes('options/')) return 'options/[name].js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.html')) {
            if (assetInfo.name.includes('popup')) return 'popup/[name][extname]';
            if (assetInfo.name.includes('options')) return 'options/[name][extname]';
          }
          if (assetInfo.name?.endsWith('.css')) {
            if (assetInfo.name.includes('popup')) return 'popup/[name][extname]';
            if (assetInfo.name.includes('options')) return 'options/[name][extname]';
            if (assetInfo.name.includes('contentScript')) return 'contentScript/css/[name][extname]';
          }
          return 'assets/[name][extname]';
        }
      }
    },
    target: ['es2015'],
    minify: false // Keep readable for debugging
  },
  plugins: [
    versionReplacePlugin()
  ],
  publicDir: '../src',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '/lib': resolve(__dirname, 'src/lib'),
      '/background': resolve(__dirname, 'src/background'),
      '/contentScript': resolve(__dirname, 'src/contentScript'),
      '/popup': resolve(__dirname, 'src/popup'),
      '/options': resolve(__dirname, 'src/options'),
      '/icons': resolve(__dirname, 'src/icons'),
      '/w3css': resolve(__dirname, 'src/w3css'),
      '/_locales': resolve(__dirname, 'src/_locales')
    }
  }
});
