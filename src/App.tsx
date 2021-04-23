import React from 'react';
import { useRoutes } from 'react-router';

import './index.css';
import { buildRoutes } from './routes';

const pages = import.meta.globEager('./pages/**/*.tsx');
const routes = buildRoutes(pages);

import { Head } from './components/Head';

export function App() {
  const content = useRoutes(routes);

  return (
    <>
      <Head />
      {content}
    </>
  );
}
