export const normalizeOrders = list =>
    list.map(o => ({
      ...o,
      createdAt : o.createdAt ? new Date(o.createdAt) : null,
      updatedAt : o.updatedAt ? new Date(o.updatedAt) : null,
    }));