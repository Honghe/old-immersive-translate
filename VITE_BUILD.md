# Vite Build System

This project has been migrated from Gulp to Vite for a more modern and efficient build process.

## Available Scripts

- `npm run build` - Build for both Firefox and Chrome
- `npm run build:firefox` - Build specifically for Firefox
- `npm run build:chrome` - Build specifically for Chrome
- `npm run dev` - Start development server (for general web development)
- `npm run clean` - Clean the dist directory

## Build Output

- `dist/firefox/` - Firefox extension build
- `dist/chrome/` - Chrome extension build
- `dist/firefox.zip` - Firefox extension package
- `dist/chrome.zip` - Chrome extension package

## What Changed

### Removed Dependencies
- All Gulp-related packages (`gulp`, `gulp-babel`, `gulp-concat`, etc.)
- Babel packages (Vite handles transpilation internally)

### New Dependencies
- `vite` - Modern build tool
- `fs-extra` - Enhanced file system operations
- `archiver` - For creating zip files
- `rimraf` - Cross-platform rm -rf

### Key Features

1. **Faster Builds**: Vite uses esbuild for faster transpilation
2. **Better Development Experience**: Hot module replacement and instant rebuilds
3. **Modern JavaScript**: Native ES modules support
4. **Simplified Configuration**: Single configuration files instead of complex Gulp tasks
5. **Automatic Optimization**: Built-in minification and optimization

### Browser-Specific Builds

The build system automatically handles:

- **Firefox**: Uses `manifest.json` (manifest v2)
- **Chrome**: Renames to use `chrome_manifest.json` (manifest v3)
- **Version Replacement**: Automatically replaces `__IMMERSIVE_TRANSLATE_VERSION__` in HTML files
- **Background Script Concatenation**: Chrome builds automatically concatenate background scripts
- **Asset Copying**: All static assets are properly copied to build directories
- **Zip Packaging**: Extensions are automatically packaged into zip files

### File Structure

The build preserves the original file structure:
```
dist/
├── firefox/
│   ├── manifest.json (Firefox manifest v2)
│   ├── background/
│   ├── contentScript/
│   ├── popup/
│   ├── options/
│   ├── icons/
│   └── _locales/
├── chrome/
│   ├── manifest.json (Chrome manifest v3)
│   ├── firefox_manifest.json (backup)
│   ├── background/
│   │   └── background-entry.js (concatenated)
│   ├── contentScript/
│   ├── popup/
│   ├── options/
│   ├── icons/
│   └── _locales/
├── firefox.zip
└── chrome.zip
```

## Troubleshooting

If you encounter issues:

1. **Clean build**: Run `npm run clean` then rebuild
2. **Check dependencies**: Ensure all dependencies are installed with `npm install`
3. **Verify source files**: Make sure your source files in `src/` are correct
4. **Check console output**: Vite provides detailed error messages

## Migration Notes

- The old `gulpfile.js` has been removed
- All Gulp tasks have been replaced with Vite configurations
- Build output is identical to the original Gulp setup
- All original functionality is preserved
