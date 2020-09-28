import { useState, useEffect } from 'react';
import { Entry } from 'contentful';
import { useCMS } from 'tinacms';
import { useContentful } from './useContentful';
import { ContentfulClient } from 'tinacms-contentful';

export interface useContentfulEntryOptions {
  spaceId?: string;
  query?: any;
}

export function useContentfulEntry<TEntryType extends Entry<any>>(
  entryId: string,
  options?: useContentfulEntryOptions
): [Entry<TEntryType> | undefined, boolean, Error | undefined] {
  const { enabled } = useCMS()
  const contentful = useContentful(options?.spaceId);
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntry = async (contentful: ContentfulClient) => {
      try {
        const entry = await contentful.getEntry<TEntryType>(entryId, {
          query: options?.query,
          preview: enabled
        });

        if (entry) {
          setEntry(entry);
          setLoading(false);
        } else {
          throw new Error(`Entry ${entryId} not found...`);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (contentful) {
      getEntry(contentful);
    }
  }, [entryId, contentful, options?.spaceId, options?.query]);

  return [entry, loading, error];
}
