// Copy dist/index.html → dist/404.html so deep links work on static hosts without rewrite rules.
import { copyFileSync, existsSync } from 'node:fs'

if (existsSync('dist/index.html')) {
  copyFileSync('dist/index.html', 'dist/404.html')
  console.log('spa-fallback: wrote dist/404.html')
}
