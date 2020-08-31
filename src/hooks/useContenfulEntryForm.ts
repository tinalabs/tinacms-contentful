import { FormOptions, useForm, Form, useCMS } from 'tinacms'
import { useState, useEffect } from 'react';
import { AnyField } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
import { ContentfulClient } from '../apis/contentful';
import { ContentfulFormMapper } from '../services/contentful/formMapper';
import { useContentfulEntry } from './useContentfulEntry';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  query?: any,
  fields?: AnyField[],
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
  preview?: boolean
}

export function useContentfulEntryForm<TEntryType extends Entry<any>>(spaceId: string, entryId: string, options: ContentfulEntryFormOptions): [Entry<TEntryType>, Form]
{
  const cms = useCMS();
  const contentful: ContentfulClient = cms.api.contentful;
  const space = contentful[spaceId];
  const [entry, loading, error] = useContentfulEntry(spaceId, entryId, {
    preview: options?.preview || false
  });
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<AnyField[]>();

  useEffect(() => {
    const getContentType = async (contentTypeId: string) => {
      try {
        const contentType = await space.deliveryClient.getContentType(contentTypeId);
  
        if (contentType) {
          setContentType(contentType);
        };
      } catch(err)
      {
        throw err;
      }
    }

    if (options.contentType) {
      setContentType(contentType);
    }
    else if (options.contentTypeId) {
      getContentType(options.contentTypeId);
    }
    else if (contentType) {
      let formFields = ContentfulFormMapper.createFieldConfigFromContentType(contentType);

      if (formFields.length > 0) {
        setFormFields(formFields);
      }
    }
    else if (options.fields) {
      setFormFields(options.fields);
    }
  });

  console.log({
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