import React from 'react';
import { Routes, Route } from 'react-router';

import './index.css';

import { Head } from './components/Head';
import Home from './pages/Home';

export function App() {
  return (
    <>
      <Head />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}
