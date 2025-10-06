// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   orderItems: [
        
//     ],

//     orderItemsSelected: [],
  
//     shippingAddress: {
        
//     },
    
//     paymentMethod: '',
//     itemsPrice: 0,
//     shippingPrice: 0,
//     taxPrice: 0,
//     totalPrice: 0,
//     user: '',
//     isPaid: false,
//     paidAt: '',
//     isDelivered: false,
//     deliveredAt: '',
//     isSuccessOrder: false,
// }

// export const orderSlide = createSlice({
//   name: 'order',
//   initialState,
//   reducers: {
//     addOrderProduct: (state, action) => {
//         const {orderItem} = action.payload
//         const itemOrder = state?.orderItems?.find((item) => 
//             item?.product === orderItem.product && 
//             item?.sizes === orderItem.sizes && 
//             item?.colors === orderItem.colors  
//     )

//         if(itemOrder) {
//             if(itemOrder.amount <= itemOrder.countInStock) {
//                 itemOrder.amount += orderItem?.amount
//                 state.isSuccessOrder = true
//                 state.isErrorOrder = false
//             }
//         } else {
//             state.orderItems.push({
//                 ...orderItem,
//                 sizes: orderItem.sizes, // Lưu kích thước đã chọn
//                 colors: orderItem.colors, // Lưu màu sắc đã chọn
//             });
//         }

//     },
//     resetOrder: (state) => {
//         state.isSuccessOrder = false
//     },
//     increaseAmount: (state, action) => {
//         const {idProduct} = action.payload
//         const itemOrder = state?.orderItems?.find((item) => item?.product === idProduct)
//         const itemOrderSelected = state?.orderItemsSelected?.find((item) => item?.product === idProduct)
//         itemOrder.amount++
//         if(itemOrderSelected) {
//             itemOrderSelected.amount++
//         }
//     },
//     decreaseAmount: (state, action) => {
//         const {idProduct} = action.payload
//         const itemOrder = state?.orderItems?.find((item) => item?.product === idProduct)
//         const itemOrderSelected = state?.orderItemsSelected?.find((item) => item?.product === idProduct)
//         itemOrder.amount--
//         if(itemOrderSelected) {
//             itemOrderSelected.amount--
//         }
//     },
//     removeOrderProduct: (state, action) => {
//         const {idProduct} = action.payload
//         const itemOrder = state?.orderItems?.filter((item) => item?.product !== idProduct)
//         const itemOrderSelected = state?.orderItemsSelected?.filter((item) => item?.product !== idProduct)
//         state.orderItems = itemOrder
//         state.orderItemsSelected = itemOrderSelected
        
//     },
//     removeAllOrderProduct: (state, action) => {
//         const {listChecked} = action.payload
//         const itemOrder = state?.orderItems?.filter((item) => !listChecked.includes(item.product))
//         const itemOrderSelected = state?.orderItemsSelected?.filter((item) => !listChecked.includes(item.product))
//         state.orderItems = itemOrder
//         state.orderItemsSelected = itemOrderSelected
        
//     },
//     selectedOrder: (state, action) => {
//         const {listChecked} = action.payload
//         const orderSelected = []
//         state.orderItems.forEach((order) => {
//             if(listChecked.includes(order.product)) {
//                 orderSelected.push(order)
//             }
//         })
//         state.orderItemsSelected = orderSelected
//     }
//   },
// })

// // Action creators are generated for each case reducer function
// export const { addOrderProduct, increaseAmount, decreaseAmount, removeOrderProduct, removeAllOrderProduct, selectedOrder, resetOrder } = orderSlide.actions

// export default orderSlide.reducer

import { createSlice } from '@reduxjs/toolkit'
import { saveCartToLocal, getCartFromLocal } from '../../utils/localCart'

const initialState = {
  orderItems: [],
  orderItemsSelected: [],
  shippingAddress: {},
  paymentMethod: '',
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  user: '',
  isPaid: false,
  paidAt: '',
  isDelivered: false,
  deliveredAt: '',
  isSuccessOrder: false,
}

export const orderSlide = createSlice({
  name: 'order',
  initialState,
  reducers: {
    loadCartFromLocal: (state, action) => {
      const userId = action.payload
      state.user = userId
      state.orderItems = getCartFromLocal(userId)
    },

    addOrderProduct: (state, action) => {
      const { orderItem } = action.payload
      const itemOrder = state.orderItems.find(
        (item) =>
          item.product === orderItem.product &&
          item.sizes === orderItem.sizes &&
          item.colors === orderItem.colors
      )

      if (itemOrder) {
        if (itemOrder.amount <= itemOrder.countInStock) {
          itemOrder.amount += orderItem.amount
          state.isSuccessOrder = true
          state.isErrorOrder = false
        }
      } else {
        state.orderItems.push(orderItem)
      }

      saveCartToLocal(state.user, state.orderItems)
    },

    resetOrder: (state) => {
      state.isSuccessOrder = false
    },

    increaseAmount: (state, action) => {
      const { idProduct } = action.payload
      const itemOrder = state.orderItems.find((item) => item.product === idProduct)
      const itemOrderSelected = state.orderItemsSelected.find((item) => item.product === idProduct)
      itemOrder.amount++
      if (itemOrderSelected) itemOrderSelected.amount++
      saveCartToLocal(state.user, state.orderItems)
    },

    decreaseAmount: (state, action) => {
      const { idProduct } = action.payload
      const itemOrder = state.orderItems.find((item) => item.product === idProduct)
      const itemOrderSelected = state.orderItemsSelected.find((item) => item.product === idProduct)
      itemOrder.amount--
      if (itemOrderSelected) itemOrderSelected.amount--
      saveCartToLocal(state.user, state.orderItems)
    },

    removeOrderProduct: (state, action) => {
      const { idProduct } = action.payload
      state.orderItems = state.orderItems.filter((item) => item.product !== idProduct)
      state.orderItemsSelected = state.orderItemsSelected.filter((item) => item.product !== idProduct)
      saveCartToLocal(state.user, state.orderItems)
    },

    removeAllOrderProduct: (state, action) => {
      const { listChecked } = action.payload
      state.orderItems = state.orderItems.filter((item) => !listChecked.includes(item.product))
      state.orderItemsSelected = state.orderItemsSelected.filter((item) => !listChecked.includes(item.product))
      saveCartToLocal(state.user, state.orderItems)
    },

    selectedOrder: (state, action) => {
      const { listChecked } = action.payload
      state.orderItemsSelected = state.orderItems.filter((item) => listChecked.includes(item.product))
    },
  },
})

export const {
  addOrderProduct,
  increaseAmount,
  decreaseAmount,
  removeOrderProduct,
  removeAllOrderProduct,
  selectedOrder,
  resetOrder,
  loadCartFromLocal,
} = orderSlide.actions

export default orderSlide.reducer
