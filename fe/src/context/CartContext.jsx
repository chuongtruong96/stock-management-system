// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useMemo } from "react";
import { toast } from "react-toastify";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems]     = useState(() => JSON.parse(localStorage.getItem("cart")||"[]"));
  const [drawerOpen, setOpen] = useState(false);

  const save = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    setItems(next);
  };

  /* exposed helpers */
  const addItem    = (p, qty=1) => {
    const next = items.some(i=>i.product.id===p.id)
      ? items.map(i=>i.product.id===p.id?{...i, qty:i.qty+qty}:i)
      : [...items, { product:p, qty }];
    save(next); toast.success("Added");
  };
  const remove     = (id)   => save(items.filter(i=>i.product.id!==id));
  const update     = (id,q) => save(items.map(i=>i.product.id===id?{...i,qty:q}:i));
  const clear      = ()     => save([]);

  const value = useMemo(()=>({
    items, drawerOpen, openCart:()=>setOpen(true), closeCart:()=>setOpen(false),
    addItem, remove, updateQty:update, clear,
    cartCount: items.reduce((s,i)=>s+i.qty,0),
    totalItems: items.length,
  }),[items,drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
