import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchContent, setKeyword, setPricingFilters, resetFilters, loadMore } from './contentSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router-dom';

const ContentPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { items, hasMore, keyword, pricingFilters } = useSelector((state: RootState) => state.content);

  useEffect(() => {
    const { keyword, pricing } = queryString.parse(location.search);
    if (keyword) dispatch(setKeyword(keyword as string));
    if (pricing) dispatch(setPricingFilters((pricing as string).split(',')));
  }, []);

  useEffect(() => {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (pricingFilters.length) params.pricing = pricingFilters.join(',');
    navigate({ search: queryString.stringify(params) });
  }, [keyword, pricingFilters]);

  useEffect(() => {
    dispatch(fetchContent());
  }, [dispatch]);

  const handleLoadMore = () => {
    dispatch(loadMore());
  };

  return (
    <div className="container">
      <h2>CLO-SET CONNECT STORE</h2>

      <div className="filters">
        <input
          placeholder="Search..."
          value={keyword}
          onChange={(e) => dispatch(setKeyword(e.target.value))}
        />

        {['Free', 'Paid', 'View Only'].map(option => (
          <label key={option}>
            <input
              type="checkbox"
              value={option}
              checked={pricingFilters.includes(option)}
              onChange={(e) => toggleFilter(e)}
            /> {option}
          </label>
        ))}

        <button onClick={() => dispatch(resetFilters())}>Reset</button>
      </div>

      <InfiniteScroll
        dataLength={items.length}
        next={handleLoadMore}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        <div className="grid">
          {items.map(item => (
           <div key={item.id} className="card">
             <img src={item.imagePath} alt={item.title} />
            <div>{item.user?.name || 'Unknown User'}</div>
            <div>{item.title}</div>
            <div>
              {item.pricingOption === 'Paid'
                ? `$${item.price}`
                : item.pricingOption}
            </div>
          </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );

  function toggleFilter(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (e.target.checked) {
      dispatch(setPricingFilters([...pricingFilters, value]));
    } else {
      dispatch(setPricingFilters(pricingFilters.filter(p => p !== value)));
    }
  }
};

export default ContentPage;