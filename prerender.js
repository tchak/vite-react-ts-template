// Pre-render the app into static HTML.
// run `yarn generate` and then `dist/static` can be served as a static site.

const fs = require('fs');
const path = require('path');

const resolve = (p) => path.resolve(__dirname, p);

const template = fs.readFileSync(resolve('dist/static/index.html'), 'utf-8');
const { render } = require('./dist/server/entry-server.js');

// determine routes to pre-render from src/pages
const routesToPrerender = fs.readdirSync(resolve('src/pages')).map((file) => {
  const name = file.replace(/\.tsx$/, '').toLowerCase();
  return name === 'home' ? `/` : `/${name}`;
});

(async () => {
  // pre-render each route...
  for (const url of routesToPrerender) {
    const context = {};
    const appHtml = await render(url, context);
    const html = template.replace(`<!--app-html-->`, appHtml);

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`;
    fs.writeFileSync(resolve(filePath), html);
    console.log('pre-rendered:', filePath);
  }
})();
