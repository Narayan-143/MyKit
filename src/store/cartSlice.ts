import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/order";
import { TAX_RATE } from "@/lib/constants/order";

export interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  isHydrated: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.isHydrated = true;
    },
    addItem: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const existing = state.items.find(
        (item) => item.menuItemId === action.payload.menuItemId
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.menuItemId !== action.payload);
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((item) => item.menuItemId === action.payload);
      if (existing && existing.quantity < 50) {
        existing.quantity += 1;
      }
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((item) => item.menuItemId === action.payload);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          state.items = state.items.filter((item) => item.menuItemId !== action.payload);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  hydrateCart,
  addItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  state.cart.items;

export const selectIsCartHydrated = (state: { cart: CartState }): boolean =>
  state.cart.isHydrated;

export const selectCartItemCount = (state: { cart: CartState }): number =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectSubtotal = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectTax = (state: { cart: CartState }): number => {
  const subtotal = selectSubtotal(state);
  return Math.round(subtotal * TAX_RATE);
};

export const selectGrandTotal = (state: { cart: CartState }): number => {
  const subtotal = selectSubtotal(state);
  const tax = selectTax(state);
  return subtotal + tax;
};

export default cartSlice.reducer;
