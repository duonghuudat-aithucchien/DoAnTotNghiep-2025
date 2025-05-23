import styled from 'styled-components';
import Slider from 'react-slick';

export const WrapperSliderStyle = styled(Slider)`
  .slick-slide {
    position: relative;
  }
  .slick-arrow.slick-prev {
    left: 12px;
    z-index: 10;
    &::before {
      font-size: 40px;
      color: #fff;
    }
  }
  .slick-arrow.slick-next {
    right: 28px;
    z-index: 10;
    &::before {
      font-size: 40px;
      color: #fff;
    }
  }
  .slick-dots {
    bottom: 10px;
    li button::before {
      color: rgba(255, 255, 255, 0.6);
    }
    li.slick-active button::before {
      color: #fff;
    }
  }
`;

export const SlideWrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 70vh;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 400px;
  }
`;

export const Overlay = styled.div`
    display: none;

`;

export const SlideContent = styled.div`
  position: absolute;
  top: 50%;
  left: 8%;
  transform: translateY(-50%);
  max-width: 600px;
  color: #222;
  z-index: 2;

  @media (max-width: 768px) {
    top: 45%;
  }
`;


export const Title = styled.h1`
  font-family: 'Roboto', sans-serif;
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  color: #111;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;


export const Description = styled.p`
  margin: 16px 0;
  font-size: 18px;
  color: #555;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;


export const CTAButton = styled.button`
  background-color: #000;
  color: #fff;
  padding: 12px 28px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  margin-top: 20px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333;
  }
`;


export const StatsContainer = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 32px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

export const StatBox = styled.div`
  color: #222;
`;

export const StatValue = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #000;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const StatLabel = styled.p`
  font-size: 14px;
  color: #777;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const BrandLogosWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 40px 20px;
  flex-wrap: wrap;
  background-color: #fafafa;
`;

export const BrandLogo = styled.img`
  height: 40px;
  max-width: 120px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.8;
  transition: all 0.3s ease;

  &:hover {
    filter: grayscale(0%);
    opacity: 1;
  }
`;
