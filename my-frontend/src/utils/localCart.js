export const GUEST_CART_KEY = 'cart_guest';

const getCartKey = (userId) => userId ? `cart_${userId}` : GUEST_CART_KEY;

export const saveCartToLocal = (userId, cartData) => {
  localStorage.setItem(getCartKey(userId), JSON.stringify(cartData));
};

export const getCartFromLocal = (userId) => {
  try {
    const data = localStorage.getItem(getCartKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const clearGuestCart = () => localStorage.removeItem(GUEST_CART_KEY);
