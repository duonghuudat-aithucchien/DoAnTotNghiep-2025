// Lưu giỏ hàng vào localStorage theo user ID
export const saveCartToLocal = (userId, cartData) => {
  if (userId) {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartData));
  }
};

// Lấy giỏ hàng từ localStorage theo user ID
export const getCartFromLocal = (userId) => {
  if (!userId) return [];
  const data = localStorage.getItem(`cart_${userId}`);
  return data ? JSON.parse(data) : [];
};
