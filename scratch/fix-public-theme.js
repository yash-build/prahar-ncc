const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../client/src/pages/public');
const layoutFile = path.join(__dirname, '../client/src/components/layout/PublicLayout.jsx');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace olive text colors with yellow
  content = content.replace(/text-olive-dark/g, 'text-yellow-400');
  content = content.replace(/text-olive-muted/g, 'text-yellow-200');
  content = content.replace(/text-olive/g, 'text-yellow-500');

  // Replace backgrounds to allow dark theme to show through
  content = content.replace(/bg-smoke/g, 'bg-transparent');
  content = content.replace(/bg-white/g, 'bg-transparent');
  content = content.replace(/bg-stone-100/g, 'border-white/10');
  
  // Make cards dark so yellow text shows properly
  content = content.replace(/className="card /g, 'className="card-dark ');
  content = content.replace(/className="card"/g, 'className="card-dark"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

const files = fs.readdirSync(publicDir);
files.forEach(file => {
  if (file.endsWith('.jsx')) {
    replaceInFile(path.join(publicDir, file));
  }
});

replaceInFile(layoutFile);
