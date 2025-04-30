import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';

// Initial state
const initialState = {
  selectedDate: dayjs().format('YYYY-MM-DD'),
  dailyStats: {
    gs: 0,
    fb: 0,
    ts: 0,
    winner: {
      team: 'BERABERE',
      score: 0
    }
  },
  loading: false,
  error: null,
  cache: new Map()
};

// Action types
const SET_DATE = 'SET_DATE';
const SET_STATS = 'SET_STATS';
const SET_LOADING = 'SET_LOADING';
const SET_ERROR = 'SET_ERROR';
const UPDATE_CACHE = 'UPDATE_CACHE';

// Reducer
const statisticsReducer = (state, action) => {
  switch (action.type) {
    case SET_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };
    case SET_STATS:
      return {
        ...state,
        dailyStats: action.payload
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    case UPDATE_CACHE:
      const newCache = new Map(state.cache);
      if (action.payload.data === null) {
        newCache.delete(action.payload.key);
      } else {
        newCache.set(action.payload.key, {
          data: action.payload.data,
          timestamp: Date.now()
        });
      }
      return {
        ...state,
        cache: newCache
      };
    default:
      return state;
  }
};

// Context
const StatisticsContext = createContext();

// Provider component
export function StatisticsProvider({ children }) {
  const [state, dispatch] = useReducer(statisticsReducer, initialState);

  const setDate = useCallback((date) => {
    if (state.selectedDate !== date) {
      dispatch({ type: SET_DATE, payload: date });
    }
  }, [state.selectedDate]);

  const setStats = useCallback((stats) => {
    dispatch({ type: SET_STATS, payload: stats });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: SET_ERROR, payload: error });
  }, []);

  const updateCache = useCallback((key, data) => {
    dispatch({ type: UPDATE_CACHE, payload: { key, data } });
  }, []);

  const getCachedData = useCallback((key) => {
    const cached = state.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > 5 * 60 * 1000) { // 5 minutes
      const newCache = new Map(state.cache);
      newCache.delete(key);
      dispatch({ type: UPDATE_CACHE, payload: { key, data: null } }); // cleanup cache properly
      return null;
    }

    return cached.data;
  }, [state.cache]);

  const value = useMemo(() => ({
    state,
    setDate,
    setStats,
    setLoading,
    setError,
    updateCache,
    getCachedData
  }), [state, setDate, setStats, setLoading, setError, updateCache, getCachedData]);

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
}

// Custom hook
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};