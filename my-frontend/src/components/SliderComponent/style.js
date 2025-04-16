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
  height: 60vh; /* Giảm chiều cao slider */

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 400px;
  }
`;


export const SlideContent = styled.div`
  position: absolute;
  top: 50%;
  left: 5%;
  transform: translateY(-50%);
  max-width: 600px;
  color: #fff;

  @media (max-width: 768px) {
    top: 45%;
  }
`;


export const Title = styled.h1`
color: black;

  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const Description = styled.p`

  margin: 16px 0;
  font-size: 16px;
  color: #eee;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const CTAButton = styled.button`
  background-color: #000;
  color: #fff;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  margin-top: 12px;
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
color: black;
`;

export const StatValue = styled.h2`
color: black;

  font-size: 28px;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const StatLabel = styled.p`
  font-size: 14px;
  color: #ccc;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;
