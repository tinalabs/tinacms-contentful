import React, { useState, useEffect } from 'react';
import { Entry, ContentType } from 'contentful';
import { Field, FormOptions, useForm, Form, useCMS } from 'tinacms';
import { ContentfulClient, createFieldConfigFromContentType } from 'tinacms-contentful';
import { useContentful } from '../hooks/useContentful';
import { mergeArrayById } from '../utils/mergeArrayById';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  spaceId?: string,
  name?: string;
  query?: any;
  entry?: Entry<any>;
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
  fields?: Field<any>[];
}

export function useContentfulEntryForm<TEntryType extends any>(
  entryId: string,
  options?: ContentfulEntryFormOptions
): [Entry<TEntryType>['fields'], Form] {
  const {enabled} = useCMS();
  const contentful = useContentful(options?.spaceId);
  const [entry, setEntry] = useState<Entry<TEntryType>>(options?.entry as Entry<TEntryType>);
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<any>[]>([]);

  useEffect(() => {
    const getEntry = async (contentful: ContentfulClient) => {
      try {
        if (!entry || entry.sys.id !== entryId) {
          const entry = await contentful.getEntry<TEntryType>(entryId, {
            query: options?.query,
            preview: enabled
          });

          if (entry) {
            setEntry(entry);
          }
        }
      } catch (error) {
        throw error;
      }
    };
    const getContentType = async (contentTypeId: string, contentful: ContentfulClient) => {
      try {
        const contentType = await contentful.getContentType(contentTypeId, {
          preview: enabled
        });

        if (contentType) {
          setContentType(contentType);
        }
      } catch (error) {
        throw error;
      }
    };
    const handleContentType = (contentful: ContentfulClient) => {
      if (contentType) {
        return;
      } else if (options?.contentType) {
        setContentType(contentType);
      } else if (options?.contentTypeId || entry?.sys.contentType) {
        const contentTypeId =
          options?.contentTypeId || entry?.sys.contentType.sys.id;

        if (contentTypeId) {
          getContentType(contentTypeId, contentful);
        }
      }
    };
    const handleFormFields = () => {
      let formFields: Field<any>[] = [];

      if (contentType && contentType.fields) {
        formFields = createFieldConfigFromContentType(
          contentType
        );
      }

      if (options?.fields?.length === 0) {
        formFields = options.fields;
      }
      else if (options?.fields) {
        mergeArrayById(formFields, options.fields);
      }

      setFormFields(formFields);
    };

    if (contentful) {
      getEntry(contentful);
      handleContentType(contentful);
      handleFormFields();
    }
  }, [
    entryId,
    contentful,
    contentType,
    options?.spaceId,
    options?.contentType,
    options?.contentTypeId,
  ]);

  return useForm<Entry<TEntryType>['fields']>({
    id: entryId, // needs to be unique
    label: options?.label || entryId,
    initialValues: entry?.fields as any,
    fields: formFields ?? [],
    actions: options?.actions || [],
    onSubmit: function(formData) {
      // TODO:
      // iterate through form links, handle updating them correctly
      // this logic can then be moved out to a helper!
      console.log(formData);
    }
  })
}
