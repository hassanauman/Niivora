"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string; // Product ID
  variantId: string;
  variantName: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // Only load valid cart data
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }

    setLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, loaded]);

  function addToCart(item: CartItem) {
    setItems((currentItems) => {
      // Variants are unique cart items
      const existingItem = currentItems.find(
        (cartItem) => cartItem.variantId === item.variantId,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.variantId === item.variantId
            ? {
                ...cartItem,
                quantity: Math.min(
                  cartItem.quantity + item.quantity,
                  cartItem.stock,
                ),
              }
            : cartItem,
        );
      }

      return [...currentItems, item];
    });
  }

  function removeFromCart(variantId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.variantId !== variantId),
    );
  }

  function updateQuantity(variantId: string, quantity: number) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.variantId !== variantId) {
          return item;
        }

        const newQuantity = Math.max(1, Math.min(quantity, item.stock));

        return {
          ...item,
          quantity: newQuantity,
        };
      }),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
