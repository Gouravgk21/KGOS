import { useState, useMemo, useCallback } from 'react';

interface FilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  initialFilter?: string;
}

export function useFilter<T extends Record<string, unknown>>({
  items,
  searchFields,
  initialFilter = '',
}: FilterOptions<T>) {
  const [search, setSearch] = useState(initialFilter);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback(
    (key: keyof T) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey]
  );

  const filtered = useMemo(() => {
    let result = items;

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return val != null && String(val).toLowerCase().includes(lower);
        })
      );
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [items, search, searchFields, sortKey, sortDir]);

  return { filtered, search, setSearch, sortKey, sortDir, handleSort };
}
