import { ComponentType, createElement } from 'react';
import { matchRoutes } from 'react-router-dom';

type RouteObject = Parameters<typeof matchRoutes>[0][0];
type PageModule = Record<string, unknown>;

export function buildRoutes(pages: Record<string, PageModule>): RouteObject[] {
  const routes: RouteObject[] = Object.keys(pages).map((path) => {
    const match = path.match(/^\.\/pages\/(.*)\.tsx$/) as RegExpMatchArray;
    const [, name] = match;
    const mod = pages[path];
    const Component = mod.default as ComponentType;

    return {
      name,
      path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
      element: createElement(Component),
      caseSensitive: false,
    };
  });

  return routes;
}
