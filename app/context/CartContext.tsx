"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Link from "next/link";
import { Check, ShoppingBag, X } from "lucide-react";

export type CartItem = {
  id: string;
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
  const [addedItem, setAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) setItems(parsedCart);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items, loaded]);

  function addToCart(item: CartItem) {
    setItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.variantId === item.variantId);
      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.variantId === item.variantId
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + item.quantity, cartItem.stock) }
            : cartItem,
        );
      }
      return [...currentItems, item];
    });
    setAddedItem(item);
  }

  function removeFromCart(variantId: string) {
    setItems((currentItems) => currentItems.filter((item) => item.variantId !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.variantId !== variantId) return item;
        return { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) };
      }),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
      {addedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setAddedItem(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-added-title"
            className="relative w-full max-w-md border border-gold/40 bg-espresso p-6 text-offwhite shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" aria-label="Close confirmation" onClick={() => setAddedItem(null)} className="absolute right-4 top-4 p-2 text-warmgrey transition hover:text-gold">
              <X size={18} />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-gold">
              <Check size={24} />
            </div>
            <p className="mt-5 text-center text-[11px] uppercase tracking-[.25em] text-gold">Added to your bag</p>
            <h2 id="cart-added-title" className="mt-2 text-center font-playfair text-3xl">Item added to cart</h2>
            <div className="mt-5 flex items-center gap-3 border-y border-bronze/30 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-charcoal text-gold"><ShoppingBag size={20} /></div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{addedItem.name}</p>
                <p className="mt-1 text-xs text-warmgrey">{addedItem.variantName} · Qty {addedItem.quantity}</p>
                <p className="mt-1 text-sm text-gold">PKR {(addedItem.price * addedItem.quantity).toLocaleString("en-PK")}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/cart" onClick={() => setAddedItem(null)} className="flex min-h-12 items-center justify-center bg-gold px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-espresso transition hover:bg-bronze">
                View Cart
              </Link>
              <button type="button" onClick={() => setAddedItem(null)} className="min-h-12 border border-gold/60 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold/10">
                Continue Shopping
              </button>
            </div>
          </section>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
