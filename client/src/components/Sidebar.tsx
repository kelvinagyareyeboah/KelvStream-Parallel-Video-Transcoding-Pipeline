import React, { Fragment } from 'react';
import { categories } from '../utils/constants';
import { SidebarProps } from '../interfaces/category';

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <Fragment>
      <aside className='ks-sidebar'>
        {categories.map((category) => (
          <button
            key={category.name}
            id={`sidebar-category-${category.name.toLowerCase().replace(/\s/g, '-')}`}
            className={`ks-category-btn ${category.name === selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
            aria-pressed={category.name === selectedCategory}
          >
            <span className='ks-category-icon'>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--ks-border)',
          fontSize: '0.7rem',
          color: 'var(--ks-text-muted)',
          padding: '16px 14px 0',
          lineHeight: '1.6',
        }}>
          KelvStream<br />
          <span style={{ opacity: 0.6 }}>Powered by HLS · DASH · FFmpeg</span>
        </div>
      </aside>
    </Fragment>
  );
};

export default Sidebar;
