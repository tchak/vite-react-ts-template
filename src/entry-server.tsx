import React, { StrictMode } from 'react';
import { IntlProvider } from 'react-intl';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetData } from 'react-helmet-async';

import { App } from './App';
import messages from '../lang/compiled/en.json';

export function render(url: string, context: { header?: HelmetData }) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <HelmetProvider context={context}>
          <IntlProvider locale="en" messages={messages}>
            <App />
          </IntlProvider>
        </HelmetProvider>
      </StaticRouter>
    </StrictMode>
  );
}
