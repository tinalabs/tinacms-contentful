import { FormOptions, useForm, Form, Field, useCMS } from 'tinacms';
import { useState, useEffect } from 'react';
import { AnyField } from '@tinacms/forms';
import { Entry, ContentType } from 'contentful';
import { ContentfulClient } from '../apis/contentful';
import { ContentfulFormMapper } from '../services/contentful/formMapper';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  name?: string;
  query?: any;
  fields?: AnyField[];
  contentType?: ContentType;
  contentTypeId?: string;
  environmentId?: string;
}

export function useContentfulEntryForm<TEntryType extends any>(
  spaceId: string,
  entry: Entry<TEntryType>,
  options: ContentfulEntryFormOptions
): [Entry<TEntryType>, Form] {
  const cms = useCMS();
  const isEditing = cms.enabled;
  const contentful: ContentfulClient = cms.api.contentful;
  const space = contentful[spaceId];
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<AnyField>[]>([]);

  useEffect(() => {
    const getContentType = async (contentTypeId: string) => {
      try {
        const client = isEditing ? space.deliveryClient : space.previewClient;
        const contentType = await client.getContentType(contentTypeId);

        console.log(contentType);

        if (contentType) {
          setContentType(contentType);
        }
      } catch (err) {
        throw err;
      }
    };

    if (contentType) {
      const mergeById = (a1: any[], a2: any[]) =>
        a1.map((item) => ({
          ...a2.find((item) => item.id === item.id && item),
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
    } else if (options.contentTypeId || entry.sys.contentType) {
      getContentType(options.contentTypeId || entry.sys.contentType.sys.id);
    } else if (options.fields) {
      setFormFields(options.fields);
    }
  }, [options.contentType, options.contentTypeId, contentType]);

  console.log(formFields);

  return useForm<Entry<TEntryType>>({
    id: entry?.sys.id, // needs to be unique
    label: options?.label ? options.label : entry.sys.id || '',
    initialValues: entry,
    fields: formFields,
    actions: options.actions || [],
    onSubmit: function (formData) {
      console.log(formData);
    },
  });
}
