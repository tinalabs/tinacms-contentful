import { useState, useEffect, useCallback } from 'react';
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
  saveOnChange?: boolean;
  publishOnSave?: boolean;
}

export function useContentfulEntryForm<EntryShape extends any>(
  entry: Entry<EntryShape>,
  options?: ContentfulEntryFormOptions
): [Entry<EntryShape>['fields'], Form] {
  const {enabled, ...cms} = useCMS();
  const contentful = useContentful(options?.spaceId);
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<Field<any>[]>([]);

  useEffect(() => {
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
      handleContentType(contentful);
      handleFormFields();
    }
  }, [
    JSON.stringify(entry),
    contentful,
    contentType,
    options?.spaceId,
    options?.contentType,
    options?.contentTypeId,
  ]);
  const updateEntry = useCallback(async (modifiedValues: any, form: any) => {
    try {
      const updatedEntry = await contentful.updateEntry(entry.sys.id, modifiedValues, { initial: entry });

      form.updateInitialValues(updatedEntry);

      // TODO: events
      cms._alerts?.success(`Saved ${options?.label || entry.sys.id}`)

      if (options?.publishOnSave) {
        await updatedEntry.publish();

        // TODO: events
        cms._alerts?.success(`Published ${options?.label || entry.sys.id}`)
      }
    } catch (error) {
      // TODO: events
      cms._alerts?.error(`Updating ${options?.label || entry.sys.id} failed...`);
    }
  }, []);
  const [modifiedValues, form] = useForm<Entry<EntryShape>['fields']>({
    id: entry.sys.id,
    label: options?.label || entry.sys.id,
    initialValues: entry?.fields as any,
    fields: formFields ?? [],
    actions: options?.actions || [],
    onSubmit: async (modifiedValues, form) => updateEntry(modifiedValues, form)
  });

  useEffect(() => {
    form.subscribe(() => {
      if (options?.saveOnChange) {
        updateEntry(modifiedValues, form)
      }
    }, { values: true })
  });

  return [modifiedValues, form];
}
