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
  Overlay,
  BrandLogosWrapper,
  BrandLogo,
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
  // const brandLogos = [
  //   'https://upload.wikimedia.org/wikipedia/commons/3/3a/Zara_Logo.svg',
  //   'https://upload.wikimedia.org/wikipedia/commons/7/76/Gucci_Logo.svg',
  //   'https://upload.wikimedia.org/wikipedia/commons/0/0e/Prada-Logo.svg',
  //   'https://upload.wikimedia.org/wikipedia/commons/d/da/Louis_Vuitton_logo_and_wordmark.svg',
  // ];
  
  return (
    <div>
    <WrapperSliderStyle {...settings}>
      {arrImages.map((image, index) => (
        <SlideWrapper key={index}>
          <Image src={image} preview={false} />
          <Overlay />
          <SlideContent>
            <Title>Khám phá bộ sưu tập mới</Title>
            <Description>
              Duyệt qua nhiều loại trang phục được thiết kế tỉ mỉ, đa dạng của chúng tôi, được thiết kế để tôn lên cá tính và phù hợp với phong cách của bạn.
            </Description>
            <CTAButton>Shop Now</CTAButton>
            <StatsContainer>
              <StatBox>
                <StatValue>200+</StatValue>
                <StatLabel>Thương hiệu quốc tế</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>2,000+</StatValue>
                <StatLabel>Sản phẩm chất lượng cao</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>30,000+</StatValue>
                <StatLabel>Khách hàng hài lòng</StatLabel>
              </StatBox>
            </StatsContainer>
          </SlideContent>
        </SlideWrapper>
      ))}
    </WrapperSliderStyle>
    {/* <BrandLogosWrapper>
    {brandLogos.map((logo, i) => (
      <BrandLogo key={i} src={logo} alt={`Brand ${i}`} />
    ))}
  </BrandLogosWrapper> */}
  </div>
  );
};

export default SliderComponent;
