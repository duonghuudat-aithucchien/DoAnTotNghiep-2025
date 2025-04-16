import React from 'react';
import { Image } from 'antd';
import {
  WrapperSliderStyle,
  SlideWrapper,
  SlideContent,
  Title,
  Description,
  CTAButton,
  StatsContainer,
  StatBox,
  StatValue,
  StatLabel,
} from './style';

const SliderComponent = ({ arrImages }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
  };

  return (
    <WrapperSliderStyle {...settings}>
      {arrImages.map((image) => (
        <SlideWrapper key={image}>
          <Image src={image} alt="slider" preview={false} width="100%" height="100%" style={{ objectFit: 'cover' }} />
          <SlideContent>
            <Title>TÌM QUẦN ÁO PHÙ HỢP VỚI PHONG CÁCH CỦA BẠN</Title>
            <Description style={{color: 'black'}}>
                Duyệt qua nhiều loại trang phục được thiết kế tỉ mỉ, đa dạng của chúng tôi, được thiết kế để tôn lên cá tính và phù hợp với phong cách của bạn.
            </Description>
            <CTAButton>Shop Now</CTAButton>

            <StatsContainer>
              <StatBox>
                <StatValue>200+</StatValue>
                <StatLabel>Thương hiệu quốc tế
                </StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>2,000+</StatValue>
                <StatLabel>Sản phẩm chất lượng cao
                </StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>30,000+</StatValue>
                <StatLabel>Khách hàng hài lòng
                </StatLabel>
              </StatBox>
            </StatsContainer>
          </SlideContent>
        </SlideWrapper>
      ))}
    </WrapperSliderStyle>
  );
};

export default SliderComponent;
