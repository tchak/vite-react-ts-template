import fs from 'fs';

import { resolve, requireForProduction } from './server';

const { template, render } = requireForProduction();

// determine routes to pre-render from src/pages
const routesToPrerender = fs.readdirSync(resolve('src/pages')).map((file) => {
  const name = file.replace(/\.tsx$/, '').toLowerCase();
  return name === 'home' ? `/` : `/${name}`;
});

(async () => {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const { appHtml, headHtml } = await render(url);
    const html = template
      .replace(`<!--app-html-->`, appHtml)
      .replace('<!--head-html-->', headHtml)
      .replace(`<!--dev-css-->`, '');

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`;
    fs.writeFileSync(resolve(filePath), html);
    console.log('pre-rendered:', filePath);
  }
})();
