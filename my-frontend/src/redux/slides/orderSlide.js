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
import { saveCartToLocal, getCartFromLocal, clearGuestCart } from '../../utils/localCart'
import { getCartItemId, mergeCarts, normalizeCartItem } from '../../utils/cart'

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
      state.orderItems = getCartFromLocal(userId).map(normalizeCartItem)
      state.orderItemsSelected = []
    },

    mergeGuestCart: (state, action) => {
      const userId = action.payload
      const merged = mergeCarts(getCartFromLocal(userId), getCartFromLocal(null))
      state.user = userId
      state.orderItems = merged
      state.orderItemsSelected = []
      saveCartToLocal(userId, merged)
      clearGuestCart()
    },

    addOrderProduct: (state, action) => {
      const { orderItem } = action.payload
      const normalizedItem = normalizeCartItem(orderItem)
      const itemOrder = state.orderItems.find(
        (item) => getCartItemId(item) === normalizedItem.cartItemId
      )

      if (itemOrder) {
        if ((itemOrder.amount + normalizedItem.amount) <= itemOrder.countInStock) {
          itemOrder.amount += normalizedItem.amount
          state.isSuccessOrder = true
          state.isErrorOrder = false
        }
      } else {
        state.orderItems.push(normalizedItem)
        state.isSuccessOrder = true
      }

      saveCartToLocal(state.user, state.orderItems)
    },

    resetOrder: (state) => {
      state.isSuccessOrder = false
    },

    increaseAmount: (state, action) => {
      const id = action.payload.cartItemId || action.payload.idProduct
      const itemOrder = state.orderItems.find((item) => getCartItemId(item) === id)
      const itemOrderSelected = state.orderItemsSelected.find((item) => getCartItemId(item) === id)
      if (itemOrder && itemOrder.amount < itemOrder.countInStock) {
        itemOrder.amount++
        if (itemOrderSelected) itemOrderSelected.amount = itemOrder.amount
      }
      saveCartToLocal(state.user, state.orderItems)
    },

    decreaseAmount: (state, action) => {
      const id = action.payload.cartItemId || action.payload.idProduct
      const itemOrder = state.orderItems.find((item) => getCartItemId(item) === id)
      const itemOrderSelected = state.orderItemsSelected.find((item) => getCartItemId(item) === id)
      if (itemOrder && itemOrder.amount > 1) {
        itemOrder.amount--
        if (itemOrderSelected) itemOrderSelected.amount = itemOrder.amount
      }
      saveCartToLocal(state.user, state.orderItems)
    },

    removeOrderProduct: (state, action) => {
      const id = action.payload.cartItemId || action.payload.idProduct
      state.orderItems = state.orderItems.filter((item) => getCartItemId(item) !== id)
      state.orderItemsSelected = state.orderItemsSelected.filter((item) => getCartItemId(item) !== id)
      saveCartToLocal(state.user, state.orderItems)
    },

    removeAllOrderProduct: (state, action) => {
      const { listChecked } = action.payload
      state.orderItems = state.orderItems.filter((item) => !listChecked.includes(getCartItemId(item)))
      state.orderItemsSelected = state.orderItemsSelected.filter((item) => !listChecked.includes(getCartItemId(item)))
      saveCartToLocal(state.user, state.orderItems)
    },

    selectedOrder: (state, action) => {
      const { listChecked } = action.payload
      state.orderItemsSelected = state.orderItems.filter((item) => listChecked.includes(getCartItemId(item)))
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
  mergeGuestCart,
} = orderSlide.actions

export default orderSlide.reducer
