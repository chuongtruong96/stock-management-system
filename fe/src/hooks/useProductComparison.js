// Phase 4: Product Comparison Hook
import { useState, useCallback, useMemo } from 'react';

const MAX_COMPARISON_ITEMS = 4;

export const useProductComparison = () => {
  const [comparisonItems, setComparisonItems] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Add item to comparison
  const addToComparison = useCallback((product) => {
    setComparisonItems(prev => {
      // Check if already in comparison
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }

      // Check if at max capacity
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        return prev;
      }

      return [...prev, { ...product, addedAt: Date.now() }];
    });
  }, []);

  // Remove item from comparison
  const removeFromComparison = useCallback((productId) => {
    setComparisonItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  // Clear all comparison items
  const clearComparison = useCallback(() => {
    setComparisonItems([]);
    setIsComparisonOpen(false);
  }, []);

  // Toggle comparison panel
  const toggleComparison = useCallback(() => {
    setIsComparisonOpen(prev => !prev);
  }, []);

  // Check if product is in comparison
  const isInComparison = useCallback((productId) => {
    return comparisonItems.some(item => item.id === productId);
  }, [comparisonItems]);

  // Get comparison data with analysis
  const comparisonData = useMemo(() => {
    if (comparisonItems.length === 0) return null;

    // Extract all unique attributes
    const allAttributes = new Set();
    comparisonItems.forEach(item => {
      Object.keys(item).forEach(key => {
        if (!['id', 'addedAt'].includes(key)) {
          allAttributes.add(key);
        }
      });
    });

    // Create comparison matrix
    const attributes = Array.from(allAttributes);
    const matrix = attributes.map(attr => ({
      attribute: attr,
      values: comparisonItems.map(item => ({
        productId: item.id,
        value: item[attr],
        displayValue: formatAttributeValue(attr, item[attr])
      })),
      hasVariation: hasAttributeVariation(attr, comparisonItems)
    }));

    // Price analysis
    const prices = comparisonItems
      .map(item => parseFloat(item.price) || 0)
      .filter(price => price > 0);
    
    const priceAnalysis = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      range: Math.max(...prices) - Math.min(...prices)
    } : null;

    // Feature comparison
    const features = extractFeatures(comparisonItems);

    return {
      items: comparisonItems,
      matrix,
      priceAnalysis,
      features,
      count: comparisonItems.length,
      canAddMore: comparisonItems.length < MAX_COMPARISON_ITEMS
    };
  }, [comparisonItems]);

  // Comparison stats
  const comparisonStats = useMemo(() => ({
    count: comparisonItems.length,
    maxCount: MAX_COMPARISON_ITEMS,
    canAddMore: comparisonItems.length < MAX_COMPARISON_ITEMS,
    isEmpty: comparisonItems.length === 0,
    isFull: comparisonItems.length >= MAX_COMPARISON_ITEMS
  }), [comparisonItems.length]);

  return {
    // State
    comparisonItems,
    comparisonData,
    comparisonStats,
    isComparisonOpen,

    // Actions
    addToComparison,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    isInComparison
  };
};

// Helper functions
const formatAttributeValue = (attribute, value) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (attribute) {
    case 'price':
      return typeof value === 'number' ? `$${value.toFixed(2)}` : value;
    case 'inStock':
      return value ? 'In Stock' : 'Out of Stock';
    case 'rating':
      return typeof value === 'number' ? `${value}/5` : value;
    case 'createdAt':
    case 'updatedAt':
      return new Date(value).toLocaleDateString();
    default:
      return String(value);
  }
};

const hasAttributeVariation = (attribute, items) => {
  const values = items.map(item => item[attribute]);
  const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
  return uniqueValues.size > 1;
};

const extractFeatures = (items) => {
  // Extract common features that might be in description or specifications
  const commonFeatures = [
    'color', 'size', 'material', 'brand', 'weight', 'dimensions',
    'warranty', 'model', 'type', 'category', 'subcategory'
  ];

  return commonFeatures.map(feature => ({
    name: feature,
    values: items.map(item => ({
      productId: item.id,
      value: item[feature] || item.specifications?.[feature] || 'N/A'
    })),
    hasVariation: items.some(item => 
      (item[feature] || item.specifications?.[feature]) !== 
      (items[0][feature] || items[0].specifications?.[feature])
    )
  })).filter(feature => 
    feature.values.some(v => v.value !== 'N/A')
  );
};