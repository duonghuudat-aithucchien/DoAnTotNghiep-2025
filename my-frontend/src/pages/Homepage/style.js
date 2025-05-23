
import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

// Wrapper cho thanh chọn loại sản phẩm (nếu dùng)
export const WrapperTypeProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-start;
  height: 44px;
`;

// Nút "Xem thêm"
export const WrapperButtonMore = styled(ButtonComponent)`
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 6px 20px;
  background-color: #fff;
  color: #000;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  width: fit-content;
  margin: 0 auto;

  &:hover {
    background-color: #000;
    color: #fff;
    span {
      color: #fff;
    }
  }

  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;


// Wrapper từng section sản phẩm theo loại
export const WrapperSection = styled.div`
  margin-top: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #ddd;
`;

// Tiêu đề section (ví dụ: NEW ARRIVALS, TOP SELLING)
export const SectionTitle = styled.h2`
  font-family: 'Roboto', sans-serif;
  font-size: 26px;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 24px;
`;

// Danh sách sản phẩm trong section
// export const WrapperProducts = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 16px;
//   justify-content: center;
// `;
// Danh sách sản phẩm có thể trượt ngang
export const WrapperProducts = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  > * {
    scroll-snap-align: start;
    flex: 0 0 auto;
  }

  cursor: grab;
  user-select: none;

  &.dragging {
    cursor: grabbing;
  }
`;


export const ArrowButton = styled.button`
  position: absolute;
  top: 35%;
  ${(props) => (props.direction === 'left' ? 'left: -10px' : 'right: -10px')};
  transform: translateY(-50%);
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 5;
  transition: background 0.2s;

  &:hover {
    background: #000;
    svg {
      color: #fff;
    }
  }

  svg {
    color: #333;
  }
`;
