import React, { useState, useEffect, Fragment } from 'react';
import { Video } from '.';
import { useParams } from 'react-router-dom';
import { fetchFromAPI } from '../utils/fetchFromAPI';

const SearchFeed: React.FC = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useParams();

  useEffect(() => {
    setLoading(true);
    fetchFromAPI(`search?part=snippet&q=${searchTerm}`)
      .then((data) => {
        setVideos(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchTerm]);

  return (
    <Fragment>
      <div
        style={{
          padding: '28px 24px',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 70px)',
          background: 'var(--ks-bg-primary)',
        }}
      >
        <h1 className='ks-feed-header'>
          Results for: <span>{searchTerm}</span>
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 320,
                  height: 240,
                  background: 'var(--ks-bg-elevated)',
                  borderRadius: 'var(--ks-radius-md)',
                  border: '1px solid var(--ks-border)',
                  animation: 'ks-pulse 1.4s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : (
          <Video videos={videos} />
        )}
      </div>
    </Fragment>
  );
};

export default SearchFeed;
