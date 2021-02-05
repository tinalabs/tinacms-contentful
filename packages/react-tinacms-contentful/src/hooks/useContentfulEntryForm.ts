import { useState, useEffect, useCallback } from 'react';
import { Entry, ContentType } from 'contentful';
import { FormOptions, useForm, Form, useCMS, WatchableFormValue } from 'tinacms';
import { ContentfulClient, createFieldConfigFromContentType } from 'tinacms-contentful';
import { useContentful } from './useContentful';
import { mergeArrayByKey } from '../utils/mergeArrayById';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  locale: string,
  contentType?: ContentType | false;
  saveOnChange?: boolean;
  publishOnSave?: boolean;
}

export function useContentfulEntryForm<EntryShape = any>(
  entry: Entry<EntryShape>,
  options: ContentfulEntryFormOptions,
  vars: Partial<WatchableFormValue>
): [Entry<EntryShape>['fields'], Form] {
  const contentful = useContentful(entry.sys.space?.sys.id);
  const {enabled, ...cms} = useCMS();
  const [contentType, setContentType] = useState<ContentType>();
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    const handleContentType = async (contentful: ContentfulClient) => {
      try {
        if (contentType) {
          return;
        } else if (options?.contentType !== false) {
          setContentType(contentType);
        } else if (entry?.sys.contentType && options.contentType !== false) {
          await getContentType(entry?.sys.contentType.sys.id, contentful);
        }
      }
      catch (error) {
        console.error(error);
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
        console.error(error);
      }
    };
    const handleFormFields = () => {
      let formFields: any[] = [];
      let defaultFields: any[] = [];

      if (contentType && contentType.fields) {
        defaultFields = createFieldConfigFromContentType(
          contentType
        );
      }

      if (options?.fields && defaultFields?.length > 0) {
        formFields = mergeArrayByKey(options.fields, defaultFields, 'name');
      } else if (options?.fields) {
        formFields = options?.fields;
      }

      if (vars.fields) {
        formFields = mergeArrayByKey(vars.fields, formFields, 'name');
      }

      setFormFields(formFields);
    };

    if (contentful) {
      handleContentType(contentful)
        .then(() => handleFormFields())
    }
  }, [
    JSON.stringify(entry),
    contentful,
    contentType,
    options?.contentType,
    vars.fields
  ]);
  const autosave = useCallback(async (form: any, options: {
    wait: number,
    immediate: boolean
  }) => {
    const { wait, immediate } = options;
    let timeout: any;

    return function debounceHandler(this: any) {
      const context = this, args = arguments;
      const callNow = immediate && !timeout;
      const later = function() {
        timeout = null;
        if (!immediate) form.submit.apply(context, [modifiedValues, form]);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow)
        form.submit.apply(context);
    };
  }, [])
  const onSubmit = useCallback(async (modifiedValues) => {
    try {
      const updatedFields = {
        ...entry.fields,
        ...modifiedValues.fields
      }
      const updatedEntry = await contentful.updateEntry(entry.sys.id, updatedFields, {
        locale: options?.locale,
        // initial: entry
      });

      console.log({
        updatedFields,
        resField: updatedEntry.fields
      })

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
      console.error(error);

      return {
        "error": error.message
      };
    }
  }, [entry, options.locale]);
  const [modifiedValues, form] = useForm<Entry<EntryShape>['fields']>({
    ...options,
    id: entry.sys.id,
    label: options?.label || entry.sys.id,
    initialValues: entry,
    fields: [],
    onSubmit
  }, {
    ...(vars || {}),
    fields: formFields
  });

  useEffect(() => {
    const unsubscribe = form.subscribe(({ dirty, submitting }) => {
      if (options?.saveOnChange && dirty && !submitting) {
        autosave(form, {
          wait: 2,
          immediate: false
        })
      }
    }, { dirty: true, submitting: true })

    return () => {
      unsubscribe();
    }
  }, []);

  return [modifiedValues, form];
}
