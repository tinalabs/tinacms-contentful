import { useState, useEffect, useMemo } from 'react';
import { Entry } from 'contentful';
import { useCMS } from 'tinacms';
import { useContentful } from './useContentful';

export interface useContentfulEntriesOptions {
  preview?: boolean;
}

export function useContentfulEntries<TEntryType = any>(
  spaceId: string,
  query: any,
  opts?: useContentfulEntriesOptions
): [Entry<TEntryType>[], boolean, Error | undefined] {
  const { enabled } = useCMS();
  const contentful = useContentful();
  const [entries, setEntries] = useState<Entry<TEntryType>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntries = async () => {
      try {
        setLoading(true);

        const entries = await contentful.getEntries<TEntryType>(query, {
          preview: enabled
        });

        if (entries) {
          setEntries(entries);
          setLoading(false);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    getEntries();
  }, [spaceId, query]);

  return useMemo(() => {
    return [entries, loading, error];
  }, [spaceId, query]);
}
