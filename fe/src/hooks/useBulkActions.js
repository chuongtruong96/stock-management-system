// Phase 4: Bulk Actions Hook
import { useState, useCallback, useMemo } from 'react';

export const useBulkActions = (items = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedItems(new Set());
    }
  }, [isSelectionMode]);

  // Select/deselect item
  const toggleItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // Select all items
  const selectAll = useCallback(() => {
    const allIds = items.map(item => item.id);
    setSelectedItems(new Set(allIds));
  }, [items]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Select range of items
  const selectRange = useCallback((startId, endId) => {
    const startIndex = items.findIndex(item => item.id === startId);
    const endIndex = items.findIndex(item => item.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    const rangeIds = items.slice(start, end + 1).map(item => item.id);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, [items]);

  // Check if item is selected
  const isSelected = useCallback((itemId) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  // Get selected items data
  const selectedItemsData = useMemo(() => {
    return items.filter(item => selectedItems.has(item.id));
  }, [items, selectedItems]);

  // Selection stats
  const selectionStats = useMemo(() => {
    const selectedCount = selectedItems.size;
    const totalCount = items.length;
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;
    
    return {
      selectedCount,
      totalCount,
      isAllSelected,
      isPartiallySelected,
      hasSelection: selectedCount > 0
    };
  }, [selectedItems.size, items.length]);

  // Bulk actions
  const bulkActions = {
    addToCart: useCallback((quantity = 1) => {
      return selectedItemsData.map(item => ({ ...item, quantity }));
    }, [selectedItemsData]),

    addToFavorites: useCallback(() => {
      return selectedItemsData;
    }, [selectedItemsData]),

    compare: useCallback(() => {
      return selectedItemsData.slice(0, 4); // Limit comparison to 4 items
    }, [selectedItemsData]),

    export: useCallback((format = 'json') => {
      const data = selectedItemsData.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category?.name,
        inStock: item.inStock
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => row[header]).join(','))
        ].join('\n');
        return csvContent;
      }

      return JSON.stringify(data, null, 2);
    }, [selectedItemsData])
  };

  // Reset selection when items change
  useState(() => {
    setSelectedItems(prev => {
      const itemIds = new Set(items.map(item => item.id));
      const filteredSelection = new Set([...prev].filter(id => itemIds.has(id)));
      return filteredSelection;
    });
  }, [items]);

  return {
    // Selection state
    selectedItems: Array.from(selectedItems),
    selectedItemsData,
    isSelectionMode,
    selectionStats,

    // Selection actions
    toggleSelectionMode,
    toggleItem,
    selectAll,
    clearSelection,
    selectRange,
    isSelected,

    // Bulk actions
    bulkActions
  };
};