const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const partialsDir = path.join(rootDir, 'partials');

const footerPartialPath = path.join(partialsDir, 'footer.html');
const footerContent = fs.existsSync(footerPartialPath)
  ? fs.readFileSync(footerPartialPath, 'utf8')
  : '';

// Reset dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

function copyAndBuild(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // Ignore build artifacts, partials, and system files
    if (
      entry.name === 'dist' ||
      entry.name === 'partials' ||
      entry.name === '.git' ||
      entry.name === 'node_modules' ||
      entry.name === 'build.js' ||
      entry.name.startsWith('.env')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyAndBuild(srcPath, destPath);
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.html')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        if (content.includes('<!-- INCLUDE:footer -->')) {
          content = content.replace(/<!--\s*INCLUDE:footer\s*-->/g, footerContent);
        }
        fs.writeFileSync(destPath, content, 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyAndBuild(rootDir, distDir);
console.log('Build completed successfully. Static site generated in dist/');
