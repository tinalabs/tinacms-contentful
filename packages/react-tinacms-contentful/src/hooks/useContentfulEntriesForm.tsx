import React, { useState, useEffect, useCallback } from 'react';
import { Entry } from 'contentful';
import { useForm, Form, useCMS, WatchableFormValue, ActionButton } from 'tinacms';
import { createFieldConfigFromContentType, createContentfulOperationsForEntries, Operation } from 'tinacms-contentful';
import { useContentful } from './useContentful';
import { mergeArrayByKey } from '../utils/mergeArrayById';
import { debounce } from '../utils/debounce';
import { AsyncAction, ContentfulEntryFormOptions } from './useContentfulEntryForm';

export type ContentfulEntriesFormOptions = ContentfulEntryFormOptions;

/**
 * Creates a TinaCMS Form for an array of entries
 * 
 * @param entry The entry to edit
 * @param options.locale The locale this entry is currently being edited in
 * @param options.spaceId If using multiple spaces, you must specify the space this entry is stored in
 * @param options.contentType Specify a content type to automatically generate a field config from (Optional)
 * @param options.saveOnChange If true, automatically saves changes after 5 seconds of inactivity, or the number of seconds specified
 * @param options.publishOnSave If true, publishes changes when the form is saved
 * @param options.references If true, also runs create, update, and delete operations for nested entry and asset references
 * @param options.buttons Specify which buttons to enable for form functionality (Save, Reset, Publish, Unpublish, Archive)
 * @param watch The TinaCMS form values to watch for changes and update the form with
 * @returns [modifiedEntries, Form]
 */
export function useContentfulEntriesForm<EntryShape extends Record<string, any> = any>(
  entries: Entry<EntryShape>[],
  options: ContentfulEntriesFormOptions,
  watch?: Partial<WatchableFormValue>
): [Entry<EntryShape>[], Form] {
  const cms = useCMS();
  const entryWithSpaceId = entries.find(entry => typeof entry?.sys?.space !== "undefined")
  const contentful = useContentful(options?.spaceId ?? entryWithSpaceId?.sys.space?.sys.id);
  
  const publishOrAchive = useCallback(async (entries, archive) => {
    const method = archive && contentful.archiveEntry.bind(contentful) || contentful.publishEntry.bind(contentful);

    try {
      // TODO: events
      cms.alerts?.info(`${archive ? "Archiving" : "Publishing"} ${options?.label || "entries"}`);
      
      if (options.references) {
        const { create } = createContentfulOperationsForEntries([], entries);

        await Promise.all(create.map((create: Operation) => method(create.sys.id)))
      }
      else {
        await Promise.all(entries.map((entry: Entry<unknown>) => method(entry.sys.id)))
      }

      // TODO: events
      cms.alerts?.success(`${archive ? "Archived" : "Published"} ${options?.label || "entries"}`)
    } catch (error) {
      cms.alerts?.error(`${archive ? "Archiving" : "Publishing"} ${options?.label || "entries"} failed...`);
      console.error(error);
    }
  }, []);
  const unpublish = useCallback(async (entries) => {
    try {
      // TODO: events
      cms.alerts?.info(`Unpublishing ${options?.label || "entries"}`);
  
      if (options.references) {
        const { create } = createContentfulOperationsForEntries([], entries);

        await Promise.all(create.map((create: Operation) => contentful.unpublishEntry(create.sys.id)))
      }
      else {
        await Promise.all(entries.map((entry: Entry<unknown>) => contentful.unpublishEntry(entry.sys.id)))
      }

      // TODO: events
      cms.alerts?.success(`Unpublished ${options?.label || "entries"}`)
    } catch (error) {
      cms.alerts?.error(`Unpublishing ${options?.label || "entries"} failed...`);
      console.error(error);
    }
  }, [])

  const [formFields, setFormFields] = useState<any[]>();
  useEffect(() => {
    const contentType = options.contentType;

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

      if (watch?.fields) {
        formFields = watch?.fields;
      }

      setFormFields(formFields);
    };

    if (contentful) {
      handleFormFields()
    }
  }, [
    contentful,
    options?.contentType,
    watch?.fields
  ]);

  const onSubmit = useCallback(async (modifiedValues: any, form: any) => {
    try {
      const updated: Entry<unknown>[] = modifiedValues.entries;
      const new_form_state = await contentful.updateEntries(updated, {
        locale: options.locale,
        initial: options?.references ? form.getState().initialValues : undefined
      })

      // Update the form to have the resolved result w/ new sys ids
      if (options.references) form.initialize({ entries: new_form_state });
      else form.initialize({
        entries: new_form_state.map((entry, i) => {
          return {
            ...modifiedValues[i],
            sys: entry.sys
          }
        })
      })

      // TODO: events
      cms.alerts?.success(`Saved ${options.label ?? "Entries"}`);

      if (options?.publishOnSave) {
        await publishOrAchive(new_form_state, false);
      }

      return;
    } catch (error) {
      // TODO: events
      cms.alerts?.error(`Updating ${options?.label || "Entries"} failed...`);
      console.error(error);

      return;
    }
  }, [entries, options.locale]);
  const [, form] = useForm<{ entries: Entry<EntryShape>[] }>({
    ...options,
    id: options.id ?? Math.random() * 10000,
    label: options?.label || "Entries",
    initialValues: { entries },
    fields: formFields,
    actions: [
      ...(options.actions || []),
      ({form}: any) => options.buttons?.publish ? <AsyncAction labels={{ idle: "Publish all", running: "Publishing..." }} action={() => publishOrAchive(form.values.entries, false)} /> : null,
      ({form}: any) => options.buttons?.unpublish ? <AsyncAction labels={{ idle: "Unpublish all", running: "Unpublishing..."}} action={() => unpublish(form.values.entries)} /> : null,
      ({form}: any) => options.buttons?.archive ? <AsyncAction labels={{ idle: "Archive all", running: "Archiving..."}} action={() => publishOrAchive(form.values.entries, false)} /> : null,
    ],
    onSubmit: (values, form) => onSubmit(values, form)
  }, {
    fields: formFields,
    label: watch?.label ?? undefined,
    values: watch?.values ?? undefined
  });

  useEffect(() => {
    const timeout = typeof options.saveOnChange === "number" ? options.saveOnChange : 5
    const unsubscribe = form.subscribe(debounce(
      async ({ dirty, submitting, active }) => {
        if (options?.saveOnChange && dirty && !submitting && !active) {
          return await form.submit();
        }

        return;
      },
      1000 * timeout, false),
    { values: true, dirty: true, submitting: true, active: true})

    return () => {
      unsubscribe();
    }
  }, []);

  return [form.finalForm.getState().values, form];
}
