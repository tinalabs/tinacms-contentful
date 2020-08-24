import { FormOptions, useForm, Form, useCMS } from 'tinacms'
import { useState, useEffect, useMemo } from 'react';
import { AnyField } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
import { ContentfulClient } from 'apis/contentful';
import { ContentfulFormMapper } from 'services/contentful/formMapper';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  query?: any,
  fields?: AnyField[],
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
}

export function useContentfulEntryForm<TEntryType extends Entry<any>>(spaceId: string, entry: Entry<any>, options: ContentfulEntryFormOptions): [Entry<TEntryType>, Form]
{
  const cms = useCMS();
  const contentful: ContentfulClient = cms.api.contentful;
  const space = contentful[spaceId];
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<AnyField[]>();

  useEffect(() => {
    const getContentType = async (contentTypeId: string) => {
      try {
        const contentType = await space.delivery.getContentType(contentTypeId);
  
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
      let formFields = ContentfulFormMapper.CreateFieldConfigFromContentType(contentType);

      if (formFields.length > 0) {
        setFormFields(formFields);
      }
    }
    else if (options.fields) {
      setFormFields(options.fields);
    }
  });

  return useMemo(() => {
    return useForm<Entry<TEntryType>>({
      id: entry?.sys.id, // needs to be unique
      label: (entry) ? options.label || entry.sys.id : "",
      initialValues: entry,
      fields: formFields || [],
      actions: options.actions || [],
      onSubmit: function(formData) {
        console.log(formData);
      },
    });
  }, [spaceId, entry]);    
}