import React, { useState, useEffect, Fragment } from 'react';
import { Sidebar, Video } from '.';
import { fetchFromAPI } from '../utils/fetchFromAPI';

const Feed: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('New');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchFromAPI(`search?part=snippet&q=${selectedCategory}`)
      .then((data) => {
        const youtubeVideos = data.items || [];

        // Query local transcoder backend to list successfully transcoded videos
        fetch('http://localhost:5000/videos')
          .then((res) => {
            if (!res.ok) throw new Error('Local server error');
            return res.json();
          })
          .then((localVideos) => {
            const formattedLocal = localVideos.map((v: any) => ({
              id: { videoId: v.id },
              snippet: {
                title: v.title,
                channelId: 'local-pipeline',
                channelTitle: 'Local Systems Pipeline',
                thumbnails: {
                  high: {
                    url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=640&auto=format&fit=crop',
                  },
                },
              },
            }));
            setVideos([...formattedLocal, ...youtubeVideos] as any);
          })
          .catch((localErr) => {
            console.warn('Local transcoder offline or empty, falling back to YouTube API:', localErr);
            // Fallback: local server offline, show YouTube-only feed
            setVideos(youtubeVideos);
          })
          .finally(() => setLoading(false));
      })
      .catch((err) => {
        console.error('Error fetching videos from RapidAPI:', err);
        setError(err?.message || 'Failed to fetch videos from API');
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <Fragment>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <Sidebar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Main Feed */}
        <main
          style={{
            flex: 1,
            padding: '28px 24px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 70px)',
            background: 'var(--ks-bg-primary)',
          }}
        >
          <h1 className='ks-feed-header'>
            <span>{selectedCategory}</span> Videos
          </h1>

          {error && (
            <div style={{
              padding: '16px 20px',
              marginBottom: '24px',
              borderRadius: 'var(--ks-radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{ fontWeight: 600 }}>⚠️ API Connection Error</p>
              <p>{error}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--ks-text-secondary)' }}>
                Tip: If you recently created or updated the <code>.env</code> file, you MUST restart your Vite dev server (stop the running command in your terminal and run <code>yarn dev</code> again) for Vite to load the environment variables.
              </p>
            </div>
          )}

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
        </main>
      </div>
    </Fragment>
  );
};

export default Feed;

