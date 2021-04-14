import React, { StrictMode } from 'react';
import { IntlProvider } from 'react-intl';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { App } from './App';
import messages from '../lang/compiled/en.json';

render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <IntlProvider locale="en" messages={messages}>
          <App />
        </IntlProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
