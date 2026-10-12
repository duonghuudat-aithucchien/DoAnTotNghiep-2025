import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  access_token: '',
  id: '',
  isAdmin: false,
  city: ''
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const payload = action.payload || {}
      if (payload.name !== undefined && payload.name !== null) state.name = payload.name
      if (payload.email !== undefined && payload.email !== null) state.email = payload.email
      if (payload.phone !== undefined && payload.phone !== null) state.phone = payload.phone
      if (payload.address !== undefined && payload.address !== null) state.address = payload.address
      if (payload.avatar !== undefined && payload.avatar !== null) state.avatar = payload.avatar
      if (payload._id) state.id = payload._id
      if (payload.id) state.id = payload.id
      if (payload.access_token) state.access_token = payload.access_token
      if (payload.isAdmin !== undefined) state.isAdmin = payload.isAdmin
      if (payload.city !== undefined && payload.city !== null) state.city = payload.city
    },
    resetUser: (state) => {
      state.name = ''
      state.email = ''
      state.phone = ''
      state.address = ''
      state.avatar = ''
      state.id = ''
      state.access_token = ''
      state.isAdmin = false
      state.city = ''

        },
    },
})

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlice.actions

export default userSlice.reducer