import { useState, useEffect } from 'react';
import { Entry } from 'contentful';
import { useCMS } from 'tinacms';
import { useContentful } from './useContentful';

export interface useContentfulEntryOptions {
  preview?: boolean;
  query?: any;
}

export function useContentfulEntry<TEntryType extends Entry<any>>(
  spaceId: string,
  entryId: string,
  opts?: useContentfulEntryOptions
): [Entry<TEntryType> | undefined, boolean, Error | undefined] {
  const { enabled } = useCMS()
  const contentful = useContentful();
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const getEntry = async () => {
      try {
        const entry = await contentful.getEntry<TEntryType>(entryId, {
          query: opts?.query,
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

    getEntry().then(() => console.log('done'));
  }, [spaceId, entryId, opts?.preview, opts?.query]);

  useEffect(() => setLoading(false), []);

  return [entry, loading, error];
}
