import { useState, useEffect, useMemo } from 'react';
import { Entry } from 'contentful';
import { useContentful } from './useContentful';

export function useContentfulEntry<TEntryType extends Entry<any>>(spaceId: string, entryId: string, query?: any): [Entry<TEntryType> | undefined, boolean, Error | undefined] {
  const delivery = useContentful(spaceId);
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntry = async () => {
      try  {
        setLoading(true);
        const entry = await delivery.getEntry<TEntryType>(entryId, query);

        if (entry) {
          setEntry(entry);
          setLoading(false);
        }
      }
      catch (error)
      {
        setError(error);
        setLoading(false);
      }
    }

    getEntry();
  }, [spaceId, entryId, query]);

  return useMemo(() => {
    return [entry, loading, error];
  }, [spaceId, entryId, query]);
}