import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';

const manifest = JSON.parse(fs.readFileSync('./src/manifest.json', 'utf-8'));

// Custom plugin to handle version replacement
function versionReplacePlugin() {
  return {
    name: 'version-replace',
    writeBundle(options) {
      const outputDir = options.dir;
      
      // Find and replace version in HTML files
      const findHtmlFiles = (dir) => {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = resolve(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(...findHtmlFiles(fullPath));
          } else if (item.endsWith('.html')) {
            files.push(fullPath);
          }
        }
        return files;
      };
      
      const htmlFiles = findHtmlFiles(outputDir);
      htmlFiles.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf-8');
        content = content.replace(/__IMMERSIVE_TRANSLATE_VERSION__/g, manifest.version);
        fs.writeFileSync(filePath, content);
      });
    }
  };
}

// Custom plugin to create zip files
function zipPlugin() {
  return {
    name: 'zip-plugin',
    writeBundle(options) {
      return new Promise((resolve, reject) => {
        const outputDir = options.dir;
        const zipPath = 'dist/firefox.zip';
        
        // Ensure dist directory exists
        fs.ensureDirSync('dist');
        
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
          console.log(`Firefox extension packaged: ${zipPath} (${archive.pointer()} bytes)`);
          resolve();
        });
        
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(outputDir, false);
        archive.finalize();
      });
    }
  };
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist/firefox',
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
    target: ['firefox63'],
    minify: false
  },
  plugins: [
    {
      name: 'copy-firefox-assets',
      writeBundle() {
        // Copy all static assets
        fs.copySync('src', 'dist/firefox', {
          filter: (src) => {
            // Skip JS files that will be built by Vite
            if (src.endsWith('.js') && (
              src.includes('background/') || 
              src.includes('contentScript/') || 
              src.includes('popup/') || 
              src.includes('options/')
            )) {
              return false;
            }
            return true;
          }
        });
        
        // Now replace version placeholders in copied HTML files
        const findHtmlFiles = (dir) => {
          const files = [];
          const items = fs.readdirSync(dir);
          
          for (const item of items) {
            const fullPath = resolve(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              files.push(...findHtmlFiles(fullPath));
            } else if (item.endsWith('.html')) {
              files.push(fullPath);
            }
          }
          return files;
        };
        
        const htmlFiles = findHtmlFiles('dist/firefox');
        htmlFiles.forEach(filePath => {
          let content = fs.readFileSync(filePath, 'utf-8');
          content = content.replace(/__IMMERSIVE_TRANSLATE_VERSION__/g, manifest.version);
          fs.writeFileSync(filePath, content);
        });
      }
    },
    zipPlugin()
  ],
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
