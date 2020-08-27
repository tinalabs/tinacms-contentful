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
  opts: useContentfulEntriesOptions
): [Entry<TEntryType>[], boolean, Error | undefined] {
  const queryMemo = useMemo(() => query, [JSON.stringify(query)]);
  const client = opts.preview
    ? useContentfulPreview(spaceId)
    : useContentful(spaceId);
  const [entries, setEntries] = useState<Entry<TEntryType>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntries = async () => {
      try {
        setLoading(true);
        console.log('calling hook????????');

        const entries = await ContentfulDeliveryService.getMany<TEntryType>(
          client,
          queryMemo
        );

        if (entries) {
          setEntries(entries);
          setLoading(false);
        }
      } catch (error) {
        console.log({ error });
        setError(error);
        setLoading(false);
      }
    };

    getEntries();
  }, [spaceId, queryMemo]);

  return useMemo(() => {
    return [entries, loading, error];
  }, [entries, loading, error]);
}
