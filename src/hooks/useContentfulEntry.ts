import { useState, useEffect, useMemo } from 'react';
import { Entry } from 'contentful';
import { useContentful } from './useContentful';
import { useContentfulPreview } from './useContentfulPreview';

export interface useContentfulEntryOptions {
  preview?: boolean;
  query?: any;
}

export function useContentfulEntry<TEntryType extends Entry<any>>(
  spaceId: string,
  entryId: string,
  opts: useContentfulEntryOptions
): [Entry<TEntryType> | undefined, boolean, Error | undefined] {
  const client = opts.preview
    ? useContentfulPreview(spaceId)
    : useContentful(spaceId);
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntry = async () => {
      try {
        setLoading(true);

        const entry = await client.getEntry<TEntryType>(entryId, opts.query);

        if (entry) {
          setEntry(entry);
          setLoading(false);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    getEntry();
  }, [spaceId, entryId, opts.preview, opts.query]);

  return useMemo(() => {
    return [entry, loading, error];
  }, [loading, entry, error]);
}
