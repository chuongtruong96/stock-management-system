// src/context/CartContext/CartProvider.jsx
import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() =>
    (JSON.parse(localStorage.getItem("cart")) || []).filter(
    (i) => i && typeof i.qty === "number" && i.product && typeof i.product === "object"
 )
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const persist = (nextItems) => {
    localStorage.setItem("cart", JSON.stringify(nextItems));
    setItems(nextItems);
  };

  const addItem = useCallback((product, qty = 1) => {
    const existingItem = items.find((i) => i.product.id === product.id);
    const next = existingItem
      ? items.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        )
      : [...items, { product, qty }];
    persist(next);
    
    const newQty = existingItem ? existingItem.qty + qty : qty;
    toast.success(`${product.name} (${newQty}) added to cart`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  }, [items]);

  const removeItem = useCallback(
    (id) => persist(items.filter((i) => i.product.id !== id)),
    [items]
  );

  const updateQty = useCallback(
    (id, qty) =>
      persist(
        items.map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i
        )
      ),
    [items]
  );

  const clear = () => persist([]);

  const isInCart = useCallback((productId) => {
    return items.some((i) => i.product.id === productId);
  }, [items]);

  const getCartItemQty = useCallback((productId) => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.qty : 0;
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      drawerOpen,
      openCart: () => setDrawerOpen(true),
      closeCart: () => setDrawerOpen(false),
      addItem,
      removeItem,
      updateQty,
      clear,
      isInCart,
      getCartItemQty,
      cartCount: items.reduce((sum, i) => sum + i.qty, 0),
      totalItems: items.length,
    }),
    [items, drawerOpen, addItem, removeItem, updateQty, isInCart, getCartItemQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
