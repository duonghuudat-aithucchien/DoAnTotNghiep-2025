import React, { useState } from 'react'
import { Checkbox, Rate } from 'antd'
import { getFilteredProducts } from  '../../service/FilterService'
import {
  WrapperContainer,
  WrapperFilterTitle,
  WrapperSection,
  WrapperContent,
  WrapperLableText,
  WrapperTextValue,
  WrapperTextPrice,
  ColorCircle,
  ApplyButton
} from './style'

const NavbarComponent = () => {
  const [filters, setFilters] = useState({
    sizes: [],
    colors: [],
    price: [],
    rating: null,
    type: '',
  })

  const onChange = (checkedValues) => {
    setFilters((prev) => ({ ...prev, sizes: checkedValues }))
  }

  const handleColorClick = (color) => {
    setFilters((prev) => {
      const exists = prev.colors.includes(color)
      return {
        ...prev,
        colors: exists ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
      }
    })
  }

  const handlePriceClick = (priceRangeStr) => {
    const [min, max] = priceRangeStr.replace(/\$/g, '').split('-').map(v => parseInt(v))
    setFilters((prev) => ({ ...prev, price: [min, max] }))
  }

  const handleRatingClick = (rating) => {
    setFilters((prev) => ({ ...prev, rating }))
  }

  const handleCategoryClick = (category) => {
    setFilters((prev) => ({ ...prev, type: category }))
  }

  const handleApplyFilter = async () => {
    try {
      const res = await getFilteredProducts(filters, 0, 12, '')
      console.log('Filtered products:', res)
      // TODO: handle filtered result, e.g., update product list in parent component
    } catch (err) {
      console.error('Filter failed:', err)
    }
  }

  const renderContent = (type, options) => {
    switch (type) {
      case 'text':
        return options.map((option, idx) => (
          <WrapperTextValue
            key={idx}
            onClick={() => handleCategoryClick(option)}
            style={{ cursor: 'pointer', fontWeight: filters.type === option ? 'bold' : 'normal' }}
          >
            {option}
          </WrapperTextValue>
        ))

      case 'checkbox':
        return (
          <Checkbox.Group
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}
            onChange={onChange}
          >
            {options.map((option, idx) => (
              <Checkbox key={idx} value={option.value}>{option.lable}</Checkbox>
            ))}
          </Checkbox.Group>
        )

      case 'start':
        return options.map((option, idx) => (
          <div
            key={idx}
            style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}
            onClick={() => handleRatingClick(option)}
          >
            <Rate style={{ fontSize: '12px' }} disabled defaultValue={option} />
            <span>{`từ ${option} sao`}</span>
          </div>
        ))

      case 'price':
        return options.map((option, idx) => (
          <WrapperTextPrice
            key={idx}
            onClick={() => handlePriceClick(option)}
            style={{ cursor: 'pointer' }}
          >
            {option}
          </WrapperTextPrice>
        ))

      case 'colors':
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {options.map((color, idx) => (
              <ColorCircle
                key={idx}
                color={color}
                onClick={() => handleColorClick(color)}
                style={{
                  cursor: 'pointer',
                  border: filters.colors.includes(color) ? '2px solid #000' : 'none'
                }}
              />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <WrapperContainer>
      <WrapperFilterTitle>Filters</WrapperFilterTitle>

      <WrapperSection>
        <WrapperLableText>Categories</WrapperLableText>
        <WrapperContent>
          {renderContent('text', ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'])}
        </WrapperContent>
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Price</WrapperLableText>
        {renderContent('price', ['$50 - $100', '$100 - $200'])}
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Colors</WrapperLableText>
        {renderContent('colors', ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#800080', '#fff', '#000'])}
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Size</WrapperLableText>
        {renderContent('checkbox', [
          { lable: 'XX-Small', value: 'XXS' },
          { lable: 'X-Small', value: 'XS' },
          { lable: 'Small', value: 'S' },
          { lable: 'Medium', value: 'M' },
          { lable: 'Large', value: 'L' },
          { lable: 'X-Large', value: 'XL' },
        ])}
      </WrapperSection>

      <WrapperSection>
        <WrapperLableText>Dress Style</WrapperLableText>
        {renderContent('text', ['Casual', 'Formal', 'Party', 'Gym'])}
      </WrapperSection>

      <ApplyButton onClick={handleApplyFilter}>Apply Filter</ApplyButton>
    </WrapperContainer>
  )
}

export default NavbarComponent
