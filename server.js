// @ts-check
const fs = require('fs');
const path = require('path');
const express = require('express');
const serveStatic = express.static;

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;
const resolve = (p) => path.resolve(__dirname, p);

async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production'
) {
  const templateProd = isProd
    ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    : '';

  const app = express();

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await require('vite').createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100,
        },
      },
    });
    // use vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    app.use(require('compression')());
    app.use(
      serveStatic(resolve('dist/client'), {
        index: false,
      })
    );
  }

  app.get('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
        const mod = await vite.moduleGraph.getModuleByUrl('/src/App.tsx');
        const cssUrls = mod.ssrTransformResult.deps.filter((d) =>
          d.endsWith('.css')
        );
        const devCss = cssUrls
          .map((url) => {
            return `<link rel="stylesheet" type="text/css" href="${url}">`;
          })
          .join('');
        template = template.replace(`<!--dev-css-->`, devCss);
      } else {
        template = templateProd;
        render = require('./dist/server/entry-server.js').render;
      }

      const context = {};
      const appHtml = render(url, context);
      const headHtml = [context.helmet.title, context.helmet.meta]
        .map((tag) => tag.toString())
        .join('');

      if (context.url) {
        return res.redirect(301, context.url);
      }

      const html = template
        .replace(`<!--app-html-->`, appHtml)
        .replace('<!--head-html-->', headHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e);
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000');
    })
  );
}

// for test use
exports.createServer = createServer;
