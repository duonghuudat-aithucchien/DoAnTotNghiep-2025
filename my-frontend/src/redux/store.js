import { combineReducers, configureStore } from '@reduxjs/toolkit'
import  productReducer  from './slides/productSlide'
import userReducer from './slides/userSlide'
import orderReducer from './slides/orderSlide'
import notificationReducer from './slides/notificationSlice'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  blacklist: ['product', 'user', 'order'] // cart is persisted per user/guest by localCart
};

const rootReducer = combineReducers({
  product: productReducer,
  user: userReducer,
  order: orderReducer,
  notification: notificationReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store)
