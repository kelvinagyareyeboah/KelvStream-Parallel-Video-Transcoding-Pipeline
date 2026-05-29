import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  demoThumbnailUrl,
  demoVideoUrl,
  demoVideoTitle,
  demoChannelUrl,
  demoChannelTitle,
} from '../utils/constants';
import { VideoCardProps } from '../interfaces/video';

const VideoCard: React.FC<VideoCardProps> = ({
  video: {
    id: { videoId },
    snippet,
  },
}) => {
  const isLocal = videoId && videoId.includes('-'); // UUID from local transcoder
  const thumbnailUrl = snippet?.thumbnails?.high?.url || demoThumbnailUrl;
  const title = snippet?.title?.slice(0, 70) || demoVideoTitle.slice(0, 70);
  const channelTitle = snippet?.channelTitle || demoChannelTitle;
  const channelId = snippet?.channelId;

  return (
    <Fragment>
      <div className='ks-video-card ks-fade-in'>
        {/* Thumbnail */}
        <Link to={videoId ? `/video/${videoId}` : demoVideoUrl} style={{ display: 'block' }}>
          <div className='ks-thumbnail-wrapper'>
            <img
              src={thumbnailUrl}
              alt={title}
              className='ks-thumbnail'
              loading='lazy'
            />
            {/* Play overlay on hover */}
            <div className='ks-play-overlay'>
              <div className='ks-play-btn'>
                <PlayArrowIcon style={{ color: 'white', fontSize: 28 }} />
              </div>
            </div>
            {/* Local HLS badge */}
            {isLocal && (
              <div className='ks-local-badge'>⚡ Local HLS</div>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className='ks-card-body'>
          <Link to={videoId ? `/video/${videoId}` : demoVideoUrl} style={{ textDecoration: 'none' }}>
            <p className='ks-card-title' title={title}>{title}</p>
          </Link>
          <Link
            to={channelId ? `/channel/${channelId}` : demoChannelUrl}
            className='ks-card-channel'
          >
            {channelTitle}
            <CheckCircleIcon style={{ fontSize: 13, color: 'var(--ks-purple-glow)' }} />
          </Link>
        </div>
      </div>
    </Fragment>
  );
};

export default VideoCard;
