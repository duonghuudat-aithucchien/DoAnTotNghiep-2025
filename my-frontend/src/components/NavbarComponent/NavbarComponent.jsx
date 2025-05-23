import React, { useState, useEffect } from 'react';
import { Checkbox, Rate } from 'antd';
import { getFilteredProducts } from '../../service/FilterService';
import {
  WrapperContainer,
  WrapperFilterTitle,
  WrapperSection,
  WrapperLableText,
  ColorCircle,
  ApplyButton,
} from './style';

const NavbarComponent = ({ setFilters, type }) => {
  const [filters, setLocalFilters] = useState({
    sizes: [],
    colors: [],
    rating: [],
    sort: '',
  });

  const [availableFilters, setAvailableFilters] = useState({
    sizes: [],
    colors: [],
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getFilteredProducts({ type }, 0, 1, '');
        console.log('filtersAvailable:', res.filtersAvailable);
        if (res.filtersAvailable) {
          setAvailableFilters(res.filtersAvailable);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    if (type) fetchFilters();
  }, [type]);

  const handleSizeChange = (checkedValues) => {
    setLocalFilters((prev) => ({ ...prev, sizes: checkedValues }));
  };

  const handleColorClick = (color) => {
    setLocalFilters((prev) => {
      const exists = prev.colors.includes(color);
      return {
        ...prev,
        colors: exists ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
      };
    });
  };

  const handleRatingChange = (checkedValues) => {
    setLocalFilters((prev) => ({ ...prev, rating: checkedValues }));
  };

  const handleApplyFilter = () => {
    const sortValue =
      filters.sort === 'price_asc'
        ? 'asc'
        : filters.sort === 'price_desc'
        ? 'desc'
        : '';

    const payload = {
      type, // ✅ giữ lại type khi lọc
      sizes: filters.sizes,
      colors: filters.colors,
      sort: sortValue,
      ...(filters.rating.length > 0 && { rating: Math.min(...filters.rating) }),
    };

    setFilters(payload);
  };

  const renderSizeCheckboxes = () => (
    <Checkbox.Group
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      value={filters.sizes}
      onChange={handleSizeChange}
    >
      {availableFilters.sizes.map((size) => (
        <Checkbox key={size} value={size}>{size}</Checkbox>
      ))}
    </Checkbox.Group>
  );

  const renderColorCircles = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {availableFilters.colors.map((color) => (
        <ColorCircle
          key={color}
          color={color}
          onClick={() => handleColorClick(color)}
          style={{
            cursor: 'pointer',
            border: filters.colors.includes(color) ? '2px solid #000' : 'none',
          }}
        />
      ))}
    </div>
  );

  // const renderRatingCheckboxes = () => (
  //   <Checkbox.Group
  //     style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
  //     value={filters.rating}
  //     onChange={handleRatingChange}
  //   >
  //     {[5, 4, 3, 2, 1].map((rating) => (
  //       <Checkbox key={rating} value={rating}>
  //         <Rate style={{ fontSize: '12px' }} disabled defaultValue={rating} />
  //         {rating === 5 ? ' 5 sao' : ` Từ ${rating} sao`}
  //       </Checkbox>
  //     ))}
  //   </Checkbox.Group>
  // );
  const renderRatingCheckboxes = () => (
    <Checkbox.Group
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      value={filters.rating}
      onChange={handleRatingChange}
    >
      {[5, 4, 3, 2, 1].map((rating) => (
        <Checkbox
          key={rating}
          value={rating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background 0.2s',
            background: filters.rating.includes(rating) ? '#f0f0f0' : 'transparent',
          }}
        >
          <Rate
            disabled
            defaultValue={rating}
            style={{ fontSize: '14px', color: '#faad14' }}
          />
          <span style={{ fontSize: '13px' }}>
            {rating === 5 ? '5 sao' : `Từ ${rating} sao`}
          </span>
        </Checkbox>
      ))}
    </Checkbox.Group>
  );
  
  
  return (
    <WrapperContainer>
      <WrapperFilterTitle>Bộ lọc</WrapperFilterTitle>

      <WrapperSection>
        <WrapperLableText>Sắp xếp theo giá</WrapperLableText>
        <select
          value={filters.sort}
          onChange={(e) => setLocalFilters((prev) => ({ ...prev, sort: e.target.value }))}
          style={{ padding: '4px 8px' }}
        >
          <option value="">Mặc định</option>
          <option value="price_asc">Giá từ thấp đến cao</option>
          <option value="price_desc">Giá từ cao đến thấp</option>
        </select>
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Màu sắc</WrapperLableText>
        {renderColorCircles()}
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Size</WrapperLableText>
        {renderSizeCheckboxes()}
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Đánh giá</WrapperLableText>
        {renderRatingCheckboxes()}
      </WrapperSection>

      <ApplyButton onClick={handleApplyFilter}>Áp dụng</ApplyButton>
      <ApplyButton
        onClick={() => {
          setLocalFilters({
            sizes: [],
            colors: [],
            rating: [],
            sort: '',
          });
          setFilters({type});
        }}
        style={{ marginTop: '10px', backgroundColor: '#ccc', color: '#000' }}
      >
        Đặt lại bộ lọc
      </ApplyButton>
    </WrapperContainer>
  );
};

export default NavbarComponent;
