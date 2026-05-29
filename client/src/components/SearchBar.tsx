import React, { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search/${searchTerm}`);
      setSearchTerm('');
    }
  };

  return (
    <Fragment>
      <form className='ks-search-form' onSubmit={handleSubmit}>
        <input
          className='ks-search-input'
          placeholder='Search videos, channels...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label='Search KelvStream'
        />
        <button type='submit' className='ks-search-btn' aria-label='Search'>
          <SearchIcon style={{ fontSize: 20 }} />
        </button>
      </form>
    </Fragment>
  );
};

export default SearchBar;
