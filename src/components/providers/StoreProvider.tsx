"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "@/store";
import { hydrateCart, selectCartItems, selectIsCartHydrated } from "@/store/cartSlice";

const CART_STORAGE_KEY = "mykit_cart_items";

function CartPersistenceSubscriber({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const isHydrated = useAppSelector(selectIsCartHydrated);
  const isInitialMount = useRef(true);

  // 1. Hydrate cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch(hydrateCart(parsed));
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    dispatch(hydrateCart([]));
  }, [dispatch]);

  // 2. Persist cart items to localStorage on state changes (only after hydration)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, isHydrated]);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartPersistenceSubscriber>{children}</CartPersistenceSubscriber>
    </Provider>
  );
}
