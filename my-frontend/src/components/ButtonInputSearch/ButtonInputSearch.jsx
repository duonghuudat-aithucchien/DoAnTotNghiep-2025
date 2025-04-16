// import React from 'react'
// import { SearchOutlined } from '@ant-design/icons';
// import InputComponent from '../InputComponent/InputComponent';
// import ButtonComponent from '../ButtonComponent/ButtonComponent';

// const ButtonInputSearch = (props) => {
//     const {size, placeholder, textButton, bordered, backgroundColorInput = '#fff', backgroundColorButton='rgb(13,92,182)', colorButton='#fff' } = props
//   return (
//     <div style={{display: 'flex', backgroundColor: '#fff' }}>
//         <InputComponent 
//             size={size} 
//             placeholder={placeholder}
//             bordered={bordered} 
//             style={{backgroundColor: backgroundColorInput, borderRadius: 0}}
//             {...props} />

//         <ButtonComponent 
//             size={size}            
//             styleButton={{background: backgroundColorButton, border: !bordered && 'none', borderRadius: 0}} 
//             icon={<SearchOutlined style={{color: colorButton}}/>}
//             textButton={textButton}
//             styleTextButton={{color: colorButton}}
//         />
//     </div>
//   )
// }

// export default ButtonInputSearch

import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

const ButtonInputSearch = ({
  size = 'middle',
  placeholder = 'Search for products...',
  value,
  onChange,
  onSearch, // callback khi nhấn Enter hoặc click icon
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.();
    }
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
    </div>
  );
};

export default ButtonInputSearch;
