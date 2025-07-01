// Phase 4: User Preferences Hook
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  RECENTLY_VIEWED: 'products_recently_viewed',
  SAVED_SEARCHES: 'products_saved_searches',
  FAVORITES: 'products_favorites',
  VIEW_PREFERENCES: 'products_view_preferences',
  FILTER_HISTORY: 'products_filter_history'
};

const DEFAULT_PREFERENCES = {
  defaultView: 'grid',
  defaultPageSize: 12,
  defaultSort: 'default',
  showRecentlyViewed: true,
  autoSaveSearches: true,
  maxRecentlyViewed: 20,
  maxSavedSearches: 10
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filterHistory, setFilterHistory] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(STORAGE_KEYS.VIEW_PREFERENCES);
      if (savedPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) });
      }

      const recentlyViewedData = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      if (recentlyViewedData) {
        setRecentlyViewed(JSON.parse(recentlyViewedData));
      }

      const savedSearchesData = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
      if (savedSearchesData) {
        setSavedSearches(JSON.parse(savedSearchesData));
      }

      const favoritesData = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (favoritesData) {
        setFavorites(JSON.parse(favoritesData));
      }

      const filterHistoryData = localStorage.getItem(STORAGE_KEYS.FILTER_HISTORY);
      if (filterHistoryData) {
        setFilterHistory(JSON.parse(filterHistoryData));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs) => {
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      setPreferences(updatedPrefs);
      localStorage.setItem(STORAGE_KEYS.VIEW_PREFERENCES, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  // Recently Viewed Products
  const addToRecentlyViewed = useCallback((product) => {
    try {
      setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        const updated = [{ ...product, viewedAt: Date.now() }, ...filtered]
          .slice(0, preferences.maxRecentlyViewed);
        localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }, [preferences.maxRecentlyViewed]);

  const clearRecentlyViewed = useCallback(() => {
    try {
      setRecentlyViewed([]);
      localStorage.removeItem(STORAGE_KEYS.RECENTLY_VIEWED);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }, []);

  // Saved Searches
  const saveSearch = useCallback((searchParams, name) => {
    try {
      const searchData = {
        id: Date.now(),
        name: name || `Search ${savedSearches.length + 1}`,
        params: searchParams,
        savedAt: Date.now(),
        usageCount: 0
      };

      setSavedSearches(prev => {
        const updated = [searchData, ...prev].slice(0, preferences.maxSavedSearches);
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated));
        return updated;
      });
      return searchData;
    } catch (error) {
      console.error('Error saving search:', error);
      return null;
    }
  }, [savedSearches.length, preferences.maxSavedSearches]);

  const loadSavedSearch = useCallback((searchId) => {
    try {
      setSavedSearches(prev => {
        const updated = prev.map(search => 
          search.id === searchId 
            ? { ...search, usageCount: search.usageCount + 1, lastUsed: Date.now() }
            : search
        );
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated));
        return updated;
      });
      return savedSearches.find(s => s.id === searchId);
    } catch (error) {
      console.error('Error loading saved search:', error);
      return null;
    }
  }, [savedSearches]);

  const deleteSavedSearch = useCallback((searchId) => {
    try {
      setSavedSearches(prev => {
        const updated = prev.filter(s => s.id !== searchId);
        localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  }, []);

  // Favorites
  const toggleFavorite = useCallback((product) => {
    try {
      setFavorites(prev => {
        const isFavorite = prev.some(p => p.id === product.id);
        const updated = isFavorite
          ? prev.filter(p => p.id !== product.id)
          : [...prev, { ...product, favoritedAt: Date.now() }];
        
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, []);

  const isFavorite = useCallback((productId) => {
    return favorites.some(p => p.id === productId);
  }, [favorites]);

  // Filter History
  const addToFilterHistory = useCallback((filterState) => {
    try {
      const historyItem = {
        id: Date.now(),
        filters: filterState,
        usedAt: Date.now(),
        usageCount: 1
      };

      setFilterHistory(prev => {
        // Check if similar filter exists
        const existingIndex = prev.findIndex(item => 
          JSON.stringify(item.filters) === JSON.stringify(filterState)
        );

        let updated;
        if (existingIndex >= 0) {
          // Update existing filter
          updated = prev.map((item, index) => 
            index === existingIndex 
              ? { ...item, usedAt: Date.now(), usageCount: item.usageCount + 1 }
              : item
          );
        } else {
          // Add new filter
          updated = [historyItem, ...prev].slice(0, 20); // Keep last 20
        }

        localStorage.setItem(STORAGE_KEYS.FILTER_HISTORY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error adding to filter history:', error);
    }
  }, []);

  const getPopularFilters = useCallback(() => {
    return filterHistory
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }, [filterHistory]);

  const clearFilterHistory = useCallback(() => {
    try {
      setFilterHistory([]);
      localStorage.removeItem(STORAGE_KEYS.FILTER_HISTORY);
    } catch (error) {
      console.error('Error clearing filter history:', error);
    }
  }, []);

  return {
    // Preferences
    preferences,
    savePreferences,
    
    // Recently Viewed
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    
    // Saved Searches
    savedSearches,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    
    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,
    
    // Filter History
    filterHistory,
    addToFilterHistory,
    getPopularFilters,
    clearFilterHistory
  };
};