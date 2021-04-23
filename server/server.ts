import fs from 'fs';
import path from 'path';
import express, { static as serveStatic } from 'express';
import compression from 'compression';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { HelmetData } from 'react-helmet-async';

export const isProduction = process.env.NODE_ENV == 'production';
export const isTest =
  process.env.NODE_ENV == 'test' || !!process.env.VITE_TEST_BUILD;

export const resolve = (p: string) => path.resolve(__dirname, '..', p);

type RenderContext = {
  helmet?: HelmetData;
  url?: string;
};

export async function createServer(
  root = process.cwd(),
  isProd = isProduction
) {
  const app = express();

  let vite: ViteDevServer;
  if (!isProd) {
    vite = await createViteServer({
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
    app.use(compression());
    app.use(
      serveStatic(resolve('dist/client'), {
        index: false,
      })
    );
  }

  app.get('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const { template, render } = isProd
        ? requireForProduction()
        : await requireForDevelopment(vite, url);
      const { appHtml, headHtml, redirectUrl } = await render(url);

      if (redirectUrl) {
        return res.redirect(301, redirectUrl);
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

  return { app };
}

async function getDevCss(vite: ViteDevServer) {
  const mod = await vite.moduleGraph.getModuleByUrl('/src/App.tsx');
  if (mod?.ssrTransformResult?.deps) {
    const cssUrls = mod.ssrTransformResult.deps.filter((d) =>
      d.endsWith('.css')
    );
    return cssUrls
      .map((url) => {
        return `<link rel="stylesheet" type="text/css" href="${url}">`;
      })
      .join('');
  }
  return '';
}

function renderHeadHtml(context: RenderContext): string {
  return [context.helmet?.title, context.helmet?.meta]
    .map((tag) => (tag ? tag.toString() : ''))
    .join('');
}

type RenderFn = (
  url: string
) => Promise<{ appHtml: string; headHtml: string; redirectUrl?: string }>;

async function requireForDevelopment(
  vite: ViteDevServer,
  url: string
): Promise<{ template: string; render: RenderFn }> {
  // always read fresh template in dev
  let template = fs.readFileSync(resolve('index.html'), 'utf-8');
  template = await vite.transformIndexHtml(url, template);
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const devCss = await getDevCss(vite);
  template = template.replace(`<!--dev-css-->`, devCss);

  return {
    template,
    render: async (url: string) => {
      const context: RenderContext = {};
      return {
        appHtml: render(url, context),
        headHtml: renderHeadHtml(context),
        redirectUrl: context.url,
      };
    },
  };
}

let template: string;
export function requireForProduction(): { template: string; render: RenderFn } {
  if (!template) {
    template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
    template = template.replace(`<!--dev-css-->`, '');
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = require(resolve('dist/server/entry-server.js'));

  return {
    template,
    render: async (url: string) => {
      const context: RenderContext = {};
      return {
        appHtml: render(url, context),
        headHtml: renderHeadHtml(context),
        redirectUrl: context.url,
      };
    },
  };
}
