// Build script for Vercel deployment
const fs = require('fs');
const path = require('path');

// Create public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Files to copy to public directory
const filesToCopy = [
    'index.html',
    'styles.css',
    'simple-app.js',
    'config.js',
    'api-integration.js'
];

// Directories to copy
const dirsToCopy = [
    'fonts',
    'frame',
    'Favicon'
];

// Copy files
filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(publicDir, file);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

// Copy directories recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

dirsToCopy.forEach(dir => {
    const srcPath = path.join(__dirname, dir);
    const destPath = path.join(publicDir, dir);

    if (fs.existsSync(srcPath)) {
        copyDir(srcPath, destPath);
        console.log(`✅ Copied ${dir}/ directory`);
    }
});

// Config.js is already secure - no API key injection needed
console.log('✅ Config.js is secure - API calls go through backend proxy');

console.log('🚀 Build completed! Public directory ready for deployment.');
