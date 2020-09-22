import { useState, useEffect, useMemo } from 'react';
import { Entry } from 'contentful';
import ContentfulDeliveryService from '../services/contentful/delivery';
import { useContentful } from './useContentful';
import { useContentfulPreview } from './useContentfulPreview';

export interface useContentfulEntriesOptions {
  preview?: boolean;
}

export function useContentfulEntries<TEntryType = any>(
  spaceId: string,
  query: any,
  opts?: useContentfulEntriesOptions
): [Entry<TEntryType>[], boolean, Error | undefined] {
  const client = opts?.preview
    ? useContentfulPreview(spaceId)
    : useContentful(spaceId);
  const [entries, setEntries] = useState<Entry<TEntryType>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntries = async () => {
      try {
        setLoading(true);

        const entries = await ContentfulDeliveryService.getMany<TEntryType>(
          client,
          query
        );

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
