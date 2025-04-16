// import styled from "styled-components";
// import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

// export const WrapperTypeProduct = styled.div`
//     display: flex;
//     align-items: center;
//     gap: 24px;
//     justify-content: flex-start;
//     height: 44px;
// `;

// export const WrapperButtonMore = styled(ButtonComponent)`
//     &:hover {
//         color: #fff;
//         background: rgb(13,92,182);
//         span {
//             color: #fff;
//         }
//     };
//     width: 100%;
//     text-align: center;
//     cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointers'}

// `

// // export const WrapperProducts = styled.div`
// //     display: flex;
// //     gap: 14px;
// //     margin-top: 20px;
// //     flex-wrap: wrap;
// // `

// export const WrapperSection = styled.div`
//   margin-top: 40px;
// `;

// export const SectionTitle = styled.h2`
//   font-size: 22px;
//   font-weight: 700;
//   text-align: center;
//   margin-bottom: 20px;
// `;

// export const WrapperProducts = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 16px;
//   justify-content: center;
// `;

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
  font-size: 26px;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 24px;
`;

// Danh sách sản phẩm trong section
export const WrapperProducts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
`;
