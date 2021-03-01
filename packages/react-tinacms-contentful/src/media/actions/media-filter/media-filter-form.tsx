import React from 'react';
import { FieldsBuilder, Form, useCMS, useForm } from 'tinacms';
import { ContentfulMediaStore, FILE_TYPES } from 'tinacms-contentful';

const STATUSES = [
  'All (Not archived)',
  'Published',
  'Changed',
  'Draft',
  'Archived'
];
const OPERATORS = [
  'is',
  'is not',
  'is less than',
  'is less than or equal to',
  'is greater than',
  'is greater than or equal to',
];

export interface MediaFilterFormProps {}

export function MediaFilterFormView() {
  const [, form] = useMediaFilterForm();

  return (
    <FieldsBuilder form={form as any} fields={form.fields} />
  )
}

export const useMediaFilterForm = (): [any, Form, boolean] => {
  const cms = useCMS();
  const mediaStore = cms.media.store;

  return useForm({
    id: 'contentful:contentful-media-filter',
    label: 'Filter Media',
    fields: [
      {
        name: "entryId",
        label: "Id",
        component: "text"
      },
      {
        name: "title",
        label: "Title",
        component: "text"
      },
      {
        name: "description",
        label: "Description",
        component: "text"
      },
      {
        name: "fileName",
        label: "Id",
        component: "text"
      },
      {
        name: 'status',
        label: 'Statuses',
        component: 'list',
        field: {
          component: 'select',
          options: STATUSES,
        },
      },
      {
        name: 'type',
        label: 'File Types',
        component: 'list',
        field: {
          component: 'select',
          options: FILE_TYPES,
        },
      },
      {
        name: 'updatedAt',
        label: 'Updated at',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'date',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'THH:mm:ssZ'
          }
        ],
      },
      {
        name: 'createdAt',
        label: 'Created at',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'date',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'THH:mm:ssZ'
          }
        ],
      },
      {
        name: 'publishedAt',
        label: 'Published at',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'date',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'THH:mm:ssZ'
          }
        ],
      },
      {
        name: 'firstPublishedAt',
        label: 'First published at',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'date',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'THH:mm:ssZ'
          }
        ],
      },
      {
        name: 'width',
        label: 'Width',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'number'
          }
        ],
      },
      {
        name: 'height',
        label: 'Height',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'number'
          }
        ],
      },
      {
        name: 'size',
        label: 'Size (KB)',
        component: 'group-list',
        itemProps: (item: any) => {
          return { label: `a` }
        },
        fields: [
          {
            name: 'operator',
            label: 'Operator',
            component: 'select',
            options: OPERATORS,
          },
          {
            name: 'value',
            label: 'Value',
            component: 'number'
          }
        ],
      }
    ],
    onSubmit: (values: any) => {
      if (mediaStore instanceof ContentfulMediaStore) {
        const filter = Object.keys(values).reduce((query: any, filter) => => {
          query[filter] = values[filter];

          return query;
        }, {});

        mediaStore.setFilter(filter);
      }
    }
  });
}