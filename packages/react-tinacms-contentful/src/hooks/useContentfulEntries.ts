import { useState, useEffect } from 'react';
import { Entry } from 'contentful';
import { useCMS } from 'tinacms';
import { useContentful } from './useContentful';
import { ContentfulClient } from 'tinacms-contentful';

export interface useContentfulEntriesOptions {
  spaceId?: string;
}

export function useContentfulEntries<TEntryType = any>(
  query: any,
  options?: useContentfulEntriesOptions
): [Entry<TEntryType>[], boolean, Error | undefined] {
  const { enabled } = useCMS();
  const contentful = useContentful(options?.spaceId);
  const [entries, setEntries] = useState<Entry<TEntryType>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntries = async (contentful: ContentfulClient) => {
      try {
        setLoading(true);

        const entries = await contentful.getEntries<TEntryType, typeof enabled>(query, {
          preview: enabled
        }) as Entry<TEntryType>[];

        if (entries) {
          setEntries(entries);
          setLoading(false);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (contentful) {
      getEntries(contentful);
    }
  }, [query, contentful, options?.spaceId]);

  return [entries, loading, error];
}
