import { useState, useEffect } from 'react';
import { Entry, ContentType } from 'contentful';
import { FormOptions, useForm, Form, useCMS } from 'tinacms';
import { AnyField, Field } from '@tinacms/forms';
import { createFieldConfigFromContentType } from 'tinacms-contentful';
import { useContentful } from '../hooks/useContentful';
import { mergeArrayById } from '../utils/mergeArrayById';

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
  const contentful = useContentful();
  const [entry, setEntry] = useState<Entry<TEntryType>>();
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<AnyField>[]>([]);

  useEffect(() => {
    const getEntry = async () => {
      try {
        if (!entry || entry.sys.id !== entryId) {
          const entry = await contentful.getEntry<TEntryType>(entryId, {
            query: options?.query,
            preview: isEditing
          });

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
        const contentType = await contentful.getContentType(contentTypeId, {
          preview: isEditing
        });

        if (contentType) {
          setContentType(contentType);
        }
      } catch (error) {
        throw error;
      }
    };
    const handleContentType = () => {
      if (contentType) {
        return;
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
        formFields = createFieldConfigFromContentType(
          contentType
        );
      }

      if (options.fields?.length === 0) {
        formFields = options.fields;
      }
      else if (options.fields) {
        mergeArrayById(formFields, options.fields);
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
