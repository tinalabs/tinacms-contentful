import React, { useState, useEffect, useCallback } from 'react';
import { Entry, ContentType } from 'contentful';
import { FormOptions, useForm, Form, useCMS, WatchableFormValue, ActionButton } from 'tinacms';
import { ContentfulClient, createFieldConfigFromContentType, createContentfulOperationsForEntry, Operation } from 'tinacms-contentful';
import { useContentful } from './useContentful';
import { mergeArrayByKey } from '../utils/mergeArrayById';
import { debounce } from '../utils/debounce';

export interface ContentfulEntryFormOptions extends Partial<FormOptions<any>> {
  locale: string,
  spaceId?: string,
  contentType?: ContentType | false;
  saveOnChange?: boolean | number;
  publishOnSave?: boolean;
  references?: boolean;
  buttons?: {
    save: string;
    reset: string;
    publish: boolean | string;
    unpublish: boolean | string;
    archive: boolean | string;
  }
}

export interface AsyncActionButtonProps {
  action: () => void
  labels: {
    idle: string;
    running: string;
  }
}

export const AsyncAction = ({ action, labels }: AsyncActionButtonProps) => {
  const [status, setStatus] = useState<"running" | "idle" | "error">("idle");
  const running = status === "running";
  const handleClick = useCallback(async () => {
    try {
      setStatus("running")

      await action();

      setStatus("idle")
    } catch (error) {
      setStatus("error");
      console.log(error);
    }
  }, [])
  const color = status === "error" ? "red" : "inherit"
  const opacity = status === "running" ? 0.5 : 1;
  const cursor = status === "running" ? "progress" : "inherit"

  return (
    <ActionButton onClick={handleClick}>
      <span style={{ color, opacity, cursor }}>
        {running && labels.running}
        {!running && labels.idle}
      </span>
    </ActionButton>
  )
}

export interface EntryStatus {
  loading: boolean
  published: boolean
}

export function useContentfulEntryForm<EntryShape extends Record<string, any> = any>(
  entry: Entry<EntryShape>,
  options: ContentfulEntryFormOptions,
  watch?: Partial<WatchableFormValue>
): [Entry<EntryShape>, Form, EntryStatus] {
  const cms = useCMS();
  const contentful = useContentful(options?.spaceId ?? entry?.sys?.space?.sys?.id);
  const [contentType, setContentType] = useState<ContentType>();
  const [isPublished, setIsPublished] = useState(false);

  const publishOrAchive = useCallback(async (entry, archive) => {
    const method =
      archive && contentful.archiveEntry.bind(contentful) ||
      isPublished && contentful.unpublishEntry.bind(contentful) ||
      contentful.publishEntry.bind(contentful);

    try {
      // TODO: events
      cms.alerts?.info(`${archive ? "Archiving" : "Publishing"} ${options?.label || entry.sys.id}`);
      
      if (options.references) {
        const { create } = createContentfulOperationsForEntry(null, entry);

        await Promise.all(create.map((create: Operation) => method(create.sys.id)))
      }
      else {
        await method(entry.sys.id)
      }

      // TODO: events
      cms.alerts?.success(`${archive ? "Archived" : "Published"} ${options?.label || entry.sys.id}`);
      if (!archive) setIsPublished(true)
    } catch (error) {
      cms.alerts?.error(`${archive ? "Archiving" : "Publishing"} ${options?.label || entry.sys.id} failed...`);
      console.error(error);
    }
  }, []);

  const [formFields, setFormFields] = useState<any[]>([]);
  useEffect(() => {
    const handleContentType = async (contentful: ContentfulClient) => {
      try {
        if (contentType) {
          return;
        } else if (options?.contentType) {
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
          preview: cms.enabled
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

      if (watch?.fields) {
        formFields = watch?.fields;
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
    watch?.fields
  ]);

  useEffect(() => {
    contentful.getEntry(entry.sys.id, { mode: "management" })
      .then(async entry => {
        const isPublished = await entry.isPublished();
        setIsPublished(isPublished)
        console.log(isPublished)
      })
      .catch(err => { console.warn(`Couldn't get publish information for ${entry}`) })
  }, []);

  const onSubmit = useCallback(async (modifiedValues, form) => {
    try {
      const new_form_state = await contentful.updateEntry(entry.sys.id, modifiedValues, {
        locale: options?.locale,
        initial: options?.references ? form.initialValues : undefined
      });

      // Update the form to have the resolved result w/ new sys ids
      if (options.references) form.initialize(new_form_state);
      else form.initialize({
        ...modifiedValues,
        sys: new_form_state.sys
      })

      // TODO: events
      cms.alerts?.success(`Saved ${options?.label || entry.sys.id}`)

      if (options?.publishOnSave) {
        await publishOrAchive(new_form_state, false);
      }

      return;
    } catch (error) {
      // TODO: events
      cms.alerts?.error(`Updating ${options?.label || entry.sys.id} failed...`);
      console.error(error);

      return;
    }
  }, [entry, options.locale]);
  const [modifiedValues, form] = useForm<Entry<EntryShape>>({
    ...options,
    id: options.id ?? entry.sys.id,
    label: options?.label || entry.sys.id,
    initialValues: entry,
    fields: options.fields,
    actions: [
      ({form}: any) => isPublished === false && options.buttons?.publish ? <AsyncAction labels={{ idle: "Publish", running: "Publishing..."}} action={() => publishOrAchive(form.values, false)} /> : null,
      ({form}: any) => isPublished === true && options.buttons?.unpublish ? <AsyncAction labels={{ idle: "Unpublish", running: "Unpublishing..."}} action={() => contentful.unpublishEntry(form.values?.sys?.id)} /> : null,
      ({form}: any) => options.buttons?.archive ? <AsyncAction labels={{ idle: "Archive", running: "Archiving..."}} action={() => publishOrAchive(form.values, false)} /> : null,
    ],
    onSubmit
  }, {
    fields: formFields,
    label: watch?.label ?? undefined,
    values: watch?.values ?? undefined
  });

  useEffect(() => {
    const timeout = typeof options.saveOnChange === "number" ? options.saveOnChange : 5
    const unsubscribe = form.subscribe(debounce(
      async ({ dirty, submitting }) => {
        if (options?.saveOnChange && dirty && !submitting) {
          return await form.submit();
        }

        return;
      },
      1000 * timeout, false),
    { values: true, dirty: true, submitting: true })

    return () => {
      unsubscribe();
    }
  }, []);

  return [modifiedValues, form, {
    loading: false,
    published: isPublished
  }];
}