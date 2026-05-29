import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Video, ChannelCard } from '.';
import { fetchFromAPI } from '../utils/fetchFromAPI';

const ChannelDetail: React.FC = () => {
  const [channelDetail, setChannelDetail] = useState<any>(null);
  const [videos, setVideos] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      const data = await fetchFromAPI(`channels?part=snippet&id=${id}`);

      setChannelDetail(data?.items[0]);

      const videosData = await fetchFromAPI(
        `search?channelId=${id}&part=snippet%2Cid&order=date`
      );

      setVideos(videosData?.items);
    };

    fetchResults();
  }, [id]);

  return (
    <div style={{ minHeight: '95vh', backgroundColor: 'var(--ks-bg-primary)' }} className="ks-fade-in">
      <div>
        <div
          style={{
            height: '280px',
            background: 'var(--ks-gradient-hero)',
            zIndex: 10,
            position: 'relative',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '-100px',
            position: 'relative',
            zIndex: 20,
          }}
        >
          <ChannelCard channelDetail={channelDetail} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1280px' }}>
          <Video videos={videos} />
        </div>
      </div>
    </div>
  );
};

export default ChannelDetail;

