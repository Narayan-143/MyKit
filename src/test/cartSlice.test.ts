import { describe, it, expect } from "vitest";
import cartReducer, {
  addItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  selectSubtotal,
  selectTax,
  selectGrandTotal,
  selectCartItemCount,
  CartState,
} from "@/store/cartSlice";

describe("Redux Cart Slice & Financial Selectors", () => {
  const initialCartState: CartState = {
    items: [],
    isHydrated: true,
  };

  const samplePizza = {
    menuItemId: "item-1",
    name: "Classic Margherita Pizza",
    price: 299,
    image: "https://images.unsplash.com/photo-1",
    category: "Pizza",
  };

  const sampleBurger = {
    menuItemId: "item-2",
    name: "Crispy Paneer Royale Burger",
    price: 219,
    image: "https://images.unsplash.com/photo-2",
    category: "Burgers",
  };

  it("should add a new item with quantity 1", () => {
    const state = cartReducer(initialCartState, addItem(samplePizza));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.items[0].name).toBe("Classic Margherita Pizza");
  });

  it("should increment quantity when adding an existing item again", () => {
    let state = cartReducer(initialCartState, addItem(samplePizza));
    state = cartReducer(state, addItem(samplePizza));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it("should increase and decrease item quantity correctly", () => {
    let state = cartReducer(initialCartState, addItem(samplePizza));
    state = cartReducer(state, increaseQuantity("item-1"));
    expect(state.items[0].quantity).toBe(2);

    state = cartReducer(state, decreaseQuantity("item-1"));
    expect(state.items[0].quantity).toBe(1);

    // Decreasing when quantity is 1 should remove the item
    state = cartReducer(state, decreaseQuantity("item-1"));
    expect(state.items).toHaveLength(0);
  });

  it("should remove item directly via removeItem action", () => {
    let state = cartReducer(initialCartState, addItem(samplePizza));
    state = cartReducer(state, addItem(sampleBurger));
    expect(state.items).toHaveLength(2);

    state = cartReducer(state, removeItem("item-1"));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].menuItemId).toBe("item-2");
  });

  it("should clear the entire cart", () => {
    let state = cartReducer(initialCartState, addItem(samplePizza));
    state = cartReducer(state, addItem(sampleBurger));
    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
  });

  it("should accurately calculate item count, subtotal, 5% tax, and grand total", () => {
    // 2 Pizzas @ 299 = 598
    // 1 Burger @ 219 = 219
    // Subtotal = 817
    // Tax (5%) = Math.round(817 * 0.05) = 41
    // Grand Total = 817 + 41 = 858
    let state = cartReducer(initialCartState, addItem(samplePizza));
    state = cartReducer(state, addItem(samplePizza));
    state = cartReducer(state, addItem(sampleBurger));

    const rootState = { cart: state };

    expect(selectCartItemCount(rootState)).toBe(3);
    expect(selectSubtotal(rootState)).toBe(817);
    expect(selectTax(rootState)).toBe(41);
    expect(selectGrandTotal(rootState)).toBe(858);
  });
});
