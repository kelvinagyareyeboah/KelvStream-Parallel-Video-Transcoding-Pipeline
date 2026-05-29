import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  return (
    <Fragment>
      <nav className='ks-navbar'>
        {/* Brand */}
        <Link to='/' className='ks-brand' aria-label='KelvStream Home'>
          <div className='ks-brand-icon'>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='white'>
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
          <span className='ks-brand-name'>KelvStream</span>
        </Link>

        {/* Search */}
        <SearchBar />

        {/* Upload Shortcut */}
        <a
          href='http://localhost:5000'
          target='_blank'
          rel='noreferrer'
          title='Upload & Transcode a Video via FFmpeg Pipeline'
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #c084fc)',
            color: 'white',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '24px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '0.82rem',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            transition: 'opacity 0.2s',
          }}
        >
          ⬆ Upload
        </a>
      </nav>
    </Fragment>
  );
};

export default Navbar;
