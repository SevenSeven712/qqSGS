#!/usr/bin/env node
/**
 * tools/build.js —— 把拆分后的工程打包回单文件
 *
 * 用法：node tools/build.js
 * 产物：dist/index.html（css/js 全部内联，可直接双击打开或上传）
 *
 * 说明：只做「读文件 → 拼字符串」，不改任何源码逻辑。
 *      根目录 index.html 是唯一入口，css/js 的加载顺序以它为准。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'index.html');
const DIST = path.join(ROOT, 'dist');

let html = fs.readFileSync(SRC, 'utf8');

// 1. 内联 CSS
html = html.replace(/[ \t]*<link rel="stylesheet" href="([^"]+)">\n?/g, (m, href) => {
  const file = path.join(ROOT, href);
  if (!fs.existsSync(file)) throw new Error('找不到样式文件：' + href);
  return `  <style>\n${fs.readFileSync(file, 'utf8')}  </style>\n`;
});

// 2. 内联 JS（保持 index.html 中的先后顺序）
html = html.replace(/[ \t]*<script src="\.\/(js\/[^"]+)"><\/script>\n?/g, (m, src) => {
  const file = path.join(ROOT, src);
  if (!fs.existsSync(file)) throw new Error('找不到脚本文件：' + src);
  return `  <script>\n${fs.readFileSync(file, 'utf8')}  </script>\n`;
});

fs.mkdirSync(DIST, { recursive: true });
const out = path.join(DIST, 'index.html');
fs.writeFileSync(out, html);

console.log(`✓ 已生成 dist/index.html（${(fs.statSync(out).size / 1024).toFixed(1)} KB，单文件可直接打开）`);
