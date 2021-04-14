import React from 'react';
import { useIntl } from 'react-intl';
import { Helmet } from 'react-helmet-async';

export function Head() {
  const intl = useIntl();
  const title = intl.formatMessage({
    defaultMessage: 'Hello Vite!',
    id: 'RQCZM4',
  });
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
