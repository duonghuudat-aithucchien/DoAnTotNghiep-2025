// import React from 'react';
// import { SearchOutlined } from '@ant-design/icons';

// const ButtonInputSearch = ({
//   size = 'middle',
//   placeholder = 'Search for products...',
//   value,
//   onChange,
//   onSearch, // callback khi nhấn Enter hoặc click icon
// }) => {
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       onSearch?.();
//     }
//   };

//   const fontSize = size === 'large' ? '16px' : size === 'small' ? '12px' : '14px';

//   return (
//     <div
//       style={{
//         display: 'flex',
//         alignItems: 'center',
//         backgroundColor: '#f2f2f2',
//         borderRadius: '999px',
//         padding: '6px 12px',
//         width: '100%',
//       }}
//     >
//       <SearchOutlined
//         onClick={onSearch}
//         style={{
//           color: '#999',
//           fontSize: 16,
//           marginRight: 8,
//           cursor: 'pointer',
//         }}
//       />
//       <input
//         type="text"
//         value={value}
//         onChange={onChange}
//         onKeyDown={handleKeyDown}
//         placeholder={placeholder}
//         style={{
//           border: 'none',
//           outline: 'none',
//           backgroundColor: 'transparent',
//           width: '100%',
//           fontSize,
//         }}
//       />
//     </div>
//   );
// };

// export default ButtonInputSearch;

import React from 'react';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';

const ButtonInputSearch = ({
  size = 'middle',
  placeholder = 'Search for products...',
  value,
  onChange,
  onSearch,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
  };

 const handleClear = () => {
  // Gọi hàm xóa
  const fakeEvent = { target: { value: '' } };
  onChange?.(fakeEvent);

  // Gọi lại hàm tìm kiếm (reset danh sách về ban đầu)
  setTimeout(() => {
    onSearch?.();
  }, 0); // delay để đảm bảo state update xong mới search
};


  const fontSize = size === 'large' ? '16px' : size === 'small' ? '12px' : '14px';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: '999px',
        padding: '6px 12px',
        width: '100%',
      }}
    >
      <SearchOutlined
        onClick={onSearch}
        style={{
          color: '#999',
          fontSize: 16,
          marginRight: 8,
          cursor: 'pointer',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          width: '100%',
          fontSize,
        }}
      />
      {value && (
        <CloseCircleFilled
          onClick={handleClear}
          style={{
            color: '#999',
            fontSize: 16,
            marginLeft: 8,
            cursor: 'pointer',
          }}
        />
      )}
    </div>
  );
};

export default ButtonInputSearch;
