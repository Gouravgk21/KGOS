'use client';

import { useEffect, useState } from 'react';
import { addChangeCallback, removeChangeCallback } from './database';

export function useLiveQuery<T>(
  querier: () => Promise<T> | T,
  deps: any[] = [],
  defaultVal?: T
): T {
  const [data, setData] = useState<T>(defaultVal as T);

  const runQuery = async () => {
    try {
      const res = await querier();
      setData(res as T);
    } catch (err) {
      console.error('Query execution failed:', err);
    }
  };

  useEffect(() => {
    void runQuery();

    const callback = () => {
      void runQuery();
    };

    addChangeCallback(callback);
    return () => {
      removeChangeCallback(callback);
    };
  }, deps);

  return data;
}
