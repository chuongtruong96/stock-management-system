export const qk = {
  categories: ["categories"],
  products:   (cat, page) => ["products", { cat, page }],
  product:    (id) => ["product", id],
  orderHist:  ["order-history"],
};