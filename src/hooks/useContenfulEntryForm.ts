import { FormOptions, useForm, Form, useCMS } from 'tinacms'
import { useState, useEffect } from 'react';
import { AnyField, Field } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
import { ContentfulFormMapper } from '../services/contentful/formMapper';
import { useContentfulEntry } from './useContentfulEntry';
import { useContentfulPreview } from './useContentfulPreview';
import { useContentful } from '../hooks/useContentful';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  name?: string;
  query?: any,
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
  fields?: AnyField[],
  preview?: boolean
}

export function useContentfulEntryForm<TEntryType extends Entry<any>>(
  spaceId: string,
  entryId: string,
  options: ContentfulEntryFormOptions
): [Entry<TEntryType>, Form]
{
  const cms = useCMS();
  const isEditing = cms.enabled;
  const client = isEditing ? useContentfulPreview(spaceId) : useContentful(spaceId);
  const [entry, setEntry] = useState<TEntryType>();
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<AnyField>[]>([]);

  useEffect(() => {
    const getEntry = async () => {
      console.log(1);
      if (!entry || entry.sys.id !== entryId) {
        const entry = await client.getEntry(entryId, options?.query);
      }
    };
    const getContentType = async (contentTypeId: string) => {
      try {
        const contentType = await client.getContentType(contentTypeId);

        if (contentType) {
          setContentType(contentType);
        };
      } catch(err)
      {
        throw err;
      }
    }

    getEntry();

    if (contentType) {
      const mergeById = (a1: any[], a2: any[]) =>
        a1.map(item => ({
            ...a2.find((item) => (item.id === item.id) && item),
            ...item
        }));
      let formFields = ContentfulFormMapper.createFieldConfigFromContentType(contentType);
      
      if (options.fields) {
        formFields = mergeById(formFields, options.fields);
      }

      if (formFields && formFields.length > 0) {
        setFormFields(formFields);
      }
    }
    else if (options.contentType) {
      setContentType(contentType);
    }
    else if (options.contentTypeId || entry?.sys.contentType) {
      const contentTypeId = options.contentTypeId || entry?.sys.contentType.sys.id;
      
      if (contentTypeId) {
        getContentType(contentTypeId);
      }
    }
    else if (options.fields) {
      setFormFields(options.fields);
    }
  }, [options.contentType, options.contentTypeId, contentType]);

  console.log({
    spaceId,
    entryId,
    entry,
    contentType,
    formFields
  });

  return useForm<Entry<TEntryType>>({
    id: entryId, // needs to be unique
    label: options.label || entryId,
    initialValues: entry,
    fields: formFields || [],
    actions: options.actions || [],
    onSubmit: function(formData) {
      console.log(formData);
    },
  });  
}