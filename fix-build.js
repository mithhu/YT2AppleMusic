#!/usr/bin/env node

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join } from "path";

console.log("🔧 Fixing extension build...");

const distDir = "./dist";

// Move HTML files to root of dist
if (existsSync(join(distDir, "src/popup/popup.html"))) {
  copyFileSync(
    join(distDir, "src/popup/popup.html"),
    join(distDir, "popup.html"),
  );
  console.log("✅ Moved popup.html to root");
}

if (existsSync(join(distDir, "src/apple-music/player.html"))) {
  copyFileSync(
    join(distDir, "src/apple-music/player.html"),
    join(distDir, "apple-music-player.html"),
  );
  console.log("✅ Moved apple-music-player.html to root");
}

// Fix HTML files to reference correct JS files
const popupHtmlPath = join(distDir, "popup.html");
if (existsSync(popupHtmlPath)) {
  let popupHtml = readFileSync(popupHtmlPath, "utf-8");
  popupHtml = popupHtml.replace("./index.tsx", "./popup.js");
  // Fix absolute paths to relative paths for Chrome extension
  popupHtml = popupHtml.replace('src="/popup.js"', 'src="./popup.js"');
  popupHtml = popupHtml.replace('href="/input.js"', 'href="./input.js"');
  popupHtml = popupHtml.replace(
    'href="/styles/input.css"',
    'href="./styles/input.css"',
  );
  writeFileSync(popupHtmlPath, popupHtml);
  console.log("✅ Fixed popup.html script reference");
}

const playerHtmlPath = join(distDir, "apple-music-player.html");
if (existsSync(playerHtmlPath)) {
  let playerHtml = readFileSync(playerHtmlPath, "utf-8");
  playerHtml = playerHtml.replace("./player.tsx", "./apple-music-player.js");
  writeFileSync(playerHtmlPath, playerHtml);
  console.log("✅ Fixed apple-music-player.html script reference");
}

// Copy icons to dist
const iconsDir = join(distDir, "icons");
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const iconFiles = ["icon-16.png", "icon-32.png", "icon-48.png", "icon-128.png"];
iconFiles.forEach((iconFile) => {
  const srcPath = join("./icons", iconFile);
  const destPath = join(iconsDir, iconFile);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${iconFile} to dist/icons/`);
  }
});

console.log("🎉 Build fixed! Extension is ready to load in Chrome.");
console.log("📁 Load the dist/ folder in chrome://extensions/");
