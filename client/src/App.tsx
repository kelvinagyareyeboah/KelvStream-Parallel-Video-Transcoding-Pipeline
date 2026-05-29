import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Feed, ChannelDetail, SearchFeed, VideoDetail } from './components';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: 'var(--ks-bg-primary)', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path='/' element={<Feed />} />
          <Route path='/video/:id' element={<VideoDetail />} />
          <Route path='/channel/:id' element={<ChannelDetail />} />
          <Route path='/search/:searchTerm' element={<SearchFeed />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
