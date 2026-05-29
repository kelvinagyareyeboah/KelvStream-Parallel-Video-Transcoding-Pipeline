import React, { Fragment } from 'react';
import { VideoI } from '../interfaces/video';
import VideoCard from './VideoCard';
import ChannelCard from './ChannelCard';

const Video: React.FC<VideoI> = ({ videos, direction }) => {
  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          flexWrap: direction === 'column' ? 'nowrap' : 'wrap',
          flexDirection: direction === 'column' ? 'column' : 'row',
          gap: '20px',
          justifyContent: 'flex-start',
        }}
      >
        {videos.map((item: any, idx: number) => (
          <div key={idx}>
            {item.id?.videoId && <VideoCard video={item} />}
            {item.id?.channelId && <ChannelCard channelDetail={item} videos={[]} />}
          </div>
        ))}
      </div>
    </Fragment>
  );
};

export default Video;
