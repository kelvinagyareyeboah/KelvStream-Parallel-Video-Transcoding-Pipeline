import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { VideoI } from '../interfaces/video';
import { demoProfilePicture } from '../utils/constants';

const ChannelCard: React.FC<VideoI> = ({ channelDetail }) => {
  const channelId = channelDetail?.id?.channelId;
  const thumbnailUrl = channelDetail?.snippet?.thumbnails?.high?.url || demoProfilePicture;
  const title = channelDetail?.snippet?.title;
  const subscribers = channelDetail?.statistics?.subscriberCount;

  return (
    <Fragment>
      <Link
        to={channelId ? `/channel/${channelId}` : '#'}
        className='ks-channel-card'
        style={{ textDecoration: 'none' }}
      >
        <img
          src={thumbnailUrl}
          alt={title}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid var(--ks-purple-primary)',
            marginBottom: 14,
            boxShadow: 'var(--ks-shadow-purple)',
          }}
        />
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ks-text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {title}
          <CheckCircleIcon style={{ fontSize: 14, color: 'var(--ks-purple-glow)' }} />
        </p>
        {subscribers && (
          <p style={{ marginTop: 4, fontSize: '0.8rem', color: 'var(--ks-text-muted)' }}>
            {parseInt(subscribers).toLocaleString()} subscribers
          </p>
        )}
      </Link>
    </Fragment>
  );
};

export default ChannelCard;
