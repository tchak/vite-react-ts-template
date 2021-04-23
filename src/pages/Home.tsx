import React from 'react';
import { FormattedMessage } from 'react-intl';

import Image from '../night.jpg?webp&width=300';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div className="prose">
        <h1>
          <FormattedMessage defaultMessage="Hello Vite!" id="RQCZM4" />
        </h1>
        <img src={Image} />
      </div>
    </div>
  );
}
