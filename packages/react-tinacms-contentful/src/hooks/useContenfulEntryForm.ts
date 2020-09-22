import { FormOptions, useForm, Form, useCMS } from 'tinacms';
import { useState, useEffect } from 'react';
import { AnyField, Field } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
import { ContentfulFormMapper } from 'tinacms-contentful';
import { useContentfulPreview } from './useContentfulPreview';
import { useContentful } from '../hooks/useContentful';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  name?: string;
  query?: any;
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
  fields?: Field<AnyField>[];
  preview?: boolean;
}

export function useContentfulEntryForm<TEntryType extends any>(
  spaceId: string,
  entryId: string,
  options: ContentfulEntryFormOptions
): [Entry<TEntryType>, Form] {
  const cms = useCMS();
  const isEditing = cms.enabled;
  const client = isEditing
    ? useContentfulPreview(spaceId)
    : useContentful(spaceId);
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<AnyField>[]>([]);

  useEffect(() => {
    const getEntry = async () => {
      try {
        if (!entry || entry.sys.id !== entryId) {
          const entry = await client.getEntry<TEntryType>(
            entryId,
            options?.query
          );

          if (entry) {
            setEntry(entry);
          }
        }
      } catch (error) {
        throw error;
      }
    };
    const getContentType = async (contentTypeId: string) => {
      try {
        const contentType = await client.getContentType(contentTypeId);

        if (contentType) {
          setContentType(contentType);
        }
      } catch (error) {
        throw error;
      }
    };
    const handleContentType = () => {
      if (contentType) {
        const mergeById = (a1: any[], a2: any[]) =>
          a1.map(item => ({
            ...a2.find(item => item.id === item.id && item),
            ...item,
          }));
        let formFields = ContentfulFormMapper.createFieldConfigFromContentType(
          contentType
        );

        if (options.fields) {
          formFields = mergeById(formFields, options.fields);
        }

        if (formFields && formFields.length > 0) {
          setFormFields(formFields);
        }
      } else if (options.contentType) {
        setContentType(contentType);
      } else if (options.contentTypeId || entry?.sys.contentType) {
        const contentTypeId =
          options.contentTypeId || entry?.sys.contentType.sys.id;

        if (contentTypeId) {
          getContentType(contentTypeId);
        }
      }
    };
    const handleFormFields = () => {
      let formFields: Field<AnyField>[] = [];

      if (contentType && contentType.fields) {
        formFields = ContentfulFormMapper.createFieldConfigFromContentType(
          contentType
        );
      }

      if (options.fields?.length === 0) {
        formFields = options.fields;
      } else if (options.fields) {
        formFields.map(field => {
          const existing = options.fields?.filter(f => f.name === field.name);

          if (existing?.length === 1) {
            return existing[0];
          }

          return field;
        });
      }

      setFormFields(formFields);
    };

    getEntry();
    handleContentType();
    handleFormFields();
  }, [
    spaceId,
    entryId,
    options.contentType,
    options.contentTypeId,
    contentType,
  ]);

  return useForm<Entry<TEntryType>>({
    id: entryId, // needs to be unique
    label: options.label || entryId,
    initialValues: entry,
    fields: formFields || [],
    actions: options.actions || [],
    onSubmit: function(formData) {
      // TODO:
      // iterate through form links, handle updating them correctly
      // this logic can then be moved out to a helper!
      console.log(formData);
    },
  });
}
