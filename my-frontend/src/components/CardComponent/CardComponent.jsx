import React from 'react'
import { StyleNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperImageStyle, WrapperPriceText, WrapperReportText, WrapperStyleTextSell } from './style';
import {StarFilled} from '@ant-design/icons'
import logo from '../../assets/images/logo.png'
import { useNavigate } from 'react-router-dom';
import {convertPrice} from '../../utils'

const CardComponent = (props) => {
    const {countInstock, description, image, name, price, rating, type, selled, discount, id} = props
    const navigate = useNavigate()
    const handleDetailsProduct = (id) => {
        navigate(`/product-details/${id}`)
    }

    // Làm tròn rating đến 1 chữ số thập phân
    const roundedRating = Number(Number(rating).toFixed(1)); // Ví dụ: 4.67 thành 4.7
    const fullStars = Math.floor(roundedRating); // Số sao đầy đủ (ví dụ: 4.7 -> 4 sao đầy)
    const hasHalfStar = roundedRating % 1 >= 0.5; // Kiểm tra xem có cần nửa sao không (tạm thời dùng logic hiển thị sao đầy)

    // Tạo mảng sao
    const stars = Array.from({ length: 5 }, (_, index) => (
        <StarFilled
            key={index}
            style={{
                fontSize: '12px',
                color: index < fullStars ? 'yellow' : (index === fullStars && hasHalfStar ? '#d3d3d3' : '#d3d3d3'), // Sao vàng hoặc xám
            }}
        />
    ));

  return (
    <WrapperCardStyle
        hoverable
        styles={{width: '200px', height: '200px'}}
        style={{width: 200 }}
        bodyStyle={{ padding: '10px'}}
        cover={<img alt="example" src={image} />}
        onClick={() => handleDetailsProduct(id)}
    >
            <img 
                src={logo} style={{
                    width: '68px', height: '14px', position: 'absolute', top: -1, left: -1, borderTopLeftRadius: '3px'
                }}
            />

        <WrapperImageStyle src={logo} alt="logo" />
        <StyleNameProduct>{name}</StyleNameProduct>
        <WrapperReportText>
            <span style={{ marginRight: '4px' }}>
                    <span style={{ marginRight: '4px' }}>{roundedRating}</span> {/* Hiển thị số rating đã làm tròn */}
                    {stars} {/* Hiển thị mảng sao */}
                </span>
            <WrapperStyleTextSell> | Đã bán {selled || 0}</WrapperStyleTextSell>
        </WrapperReportText>
        <WrapperPriceText>
            <span style={{marginRight: '8px'}}>
                {convertPrice(price)}
            </span>

            <WrapperDiscountText>
                - {discount || 5} %
            </WrapperDiscountText>
        </WrapperPriceText>
  </WrapperCardStyle>
  )
}

export default CardComponent