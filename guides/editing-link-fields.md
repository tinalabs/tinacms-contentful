# Editing entries with link fields

This guide covers how you can edit entries that have link fields. You can edit a single entry, maintaining its existing links, or create a TinaCMS form that makes all of the links editable.

We will cover how to do the following in plain JavaScript and in React:

- [Editing entries with link fields](#editing-entries-with-link-fields)
  - [Pre-requisites](#pre-requisites)
  - [Editing Your First Entry with Links](#editing-your-first-entry-with-links)
  - [Editing Links](#editing-links)
  - [Creating Links](#creating-links)

## Pre-requisites

To follow this guide, the following is expected:

- You have a working application with TinaCMS already setup with Contentful. If not, [please follow the docs to add Contentful to a TinaCMS site](https://github.com/tinalabs/tinacms-contentful/blob/master/README.md#quick-start).
- You have setup [OAuth applications with Contentful](https://www.contentful.com/developers/docs/extensibility/oauth/) if you plan to have your users authenticate with Contentful.
- You have a space with Content Models and Entries ready to use, and have setup [delivery and preview API access tokens](https://www.contentful.com/developers/docs/references/authentication#api-keys-in-the-contentful-web-app) and have them readily available.
- You have the `id` of an existing entry that has links.

## Editing Your First Entry with Links

The most basic form of editing an entry with links is simply _persisting_ the links. This means the links are _not_ editable, but will not be removed when editing the entry's other fields.

For example, assuming an entry with a title field, you can do an update programtically as follows:

```
const contentful = cms.api.contentful
const entry = contentful.getEntry('ENTRY_ID', { mode: "preview" })
  .then(entry => {
    entry.fields.title = "Updated title";

    return entry;
  })
  .then(entry => contentful.updateEntry('ENTRY_ID', entry))
  .then(updated_entry => console.log(entry))
  .catch(error => console.error(error))  
}
```

You can also create a form in plain Javascript and register it with the CMS to allow content editors to edit the entry in the sidebar or via inline editing:

```
import { Form } from 'tinacms'

const contentful = cms.api.contentful
const form = new Form({
  id: "example-entry",
  label: "Example Entry",
  fields: [
    { name: "fields.title", label: "Title", component: "text" }
  ],
  loadInitialValues: contentful.getEntry('ENTRY_ID', { mode: "preview" }),
  onSubmit: (values) => {
    contentful.updateEntry(values.sys.id, values)
      .then(updated_entry => {
        console.log(entry)
        cms.alerts.success("Entry updated")
      })
      .catch(error => {
        console.error(error)
        cms.alerts.error("Entry failed to update")
      })  
  }
})

cms.plugins.add(form)
```

In React, you can use the `useContentfulEntry` or `useContentfulEntries` to create a form, which also enables useful featuers like:

- Autosaving
- Publishing on save
- Publish button
- Unpublish button
- Archive button


This can be done as follow:

```
import { usePlugin } from 'tinacms'
import { useContentfulEntryForm } from 'react-tinacms-contentful'

export const ExampleEntry = ({ entry }) => (
  <article>
    <h2>{entry.fields.title}</h2>
    <p>{entry.sys.id}
  </article>
)

export const EditableExampleEntry = ({ entry }) => {
  const [modifiedEntry, form] = useContentfulEntryForm(entry, {
    id: "example-entry",
    label: "Example Entry",
    locale: "en",
    autosave: 30, // save after 30 seconds of inactivity,
    buttons: {
      publish: true,
      unpublish: true,
      archive: true
    }
  })

  usePlugin(form)

  return <ExampleEntry entry={modifiedEntry} />
}
```

## Editing Links

You can also edit links by providing an initial state of the entry or entries you are editing, and the updated state of the entries you are editing. Then updates for all nested links will be ran and all entries will be updated to reflect these changes.

For example, assuming an entry with a `title` field and an `author` field that links to an "Auhtor Entry" based on an Author content model:

```
const updated = {
  sys: { ... },
  fields: {
    title: "Updated title",
    author: {
      sys: { ... },
      fields: {
        firstName: "John",
        lastName: "Appleseed",
        title: "Staff writer"
      }
    }
  }
}
const contentful = cms.api.contentful
const entry = contentful.getEntry('ENTRY_ID', { mode: "preview" })
  .then(initial_entry => {
    const updated_entry = initial_entry;

    updated.fields.title = "Updated title";
    updated.fields.author.fields.title = "Staff writer";

    return [initial_entry, update];
  })
  .then([initial_entry, update] => contentful.updateEntry('ENTRY_ID', update), { locale: "en", initial: update })
  .then(updated_entry => console.log(entry))
  .catch(error => console.error(error))  
}
```

This can also be done inside a form with Vanilla JS:

```
import { Form } from 'tinacms'

const contentful = cms.api.contentful
const form = new Form({
  id: "example-entry",
  label: "Example Entry",
  fields: [
    { name: "fields.title", label: "Title", component: "text" }.
    { name: "fields.author", label: "Author", component: "group", fields: [
      { name: "fields.firstName", label: "First Name", component: "text" },
      { name: "fields.lastName", label: "First Name", component: "text" },
      { name: "fields.title", label: "Title", component: "text" },
    }]
  ],
  loadInitialValues: contentful.getEntry('ENTRY_ID', { mode: "preview" }),
  onSubmit: (values, form) => {
    contentful.updateEntry(values.sys.id, values, { locale: "en", initial: form.getState().initialValues })
      .then(updated_entry => {
        console.log(entry)
        cms.alerts.success("Entry updated")
      })
      .catch(error => {
        console.error(error)
        cms.alerts.error("Entry failed to update")
      })  
  }
})

cms.plugins.add(form)
```

Or even more simply in React, using the `references` option:

```
import { usePlugin } from 'tinacms'
import { useContentfulEntryForm } from 'react-tinacms-contentful'

export const ExampleEntry = ({ entry }) => (
  <article>
    <h2>{entry.fields.title}</h2>
    <p>{entry.sys.id}
  </article>
)

export const EditableExampleEntry = ({ entry }) => {
  const [modifiedEntry, form] = useContentfulEntryForm(entry, {
    id: "example-entry",
    label: "Example Entry",
    locale: "en",
    references: true, // automatically handle nested links if present
    autosave: 30, // save after 30 seconds of inactivity,
    buttons: {
      publish: true,
      unpublish: true,
      archive: true
    },
    fields: [
      { name: "fields.title", label: "Title", component: "text" }.
      { name: "fields.author", label: "Author", component: "group", fields: [
        { name: "fields.firstName", label: "First Name", component: "text" },
        { name: "fields.lastName", label: "First Name", component: "text" },
        { name: "fields.title", label: "Title", component: "text" },
    }]
  })

  usePlugin(form)

  return <ExampleEntry entry={modifiedEntry} />
}
```

## Creating Links

You can also create links when creating a new entry, by setting `references` true and providing the full data for the linked entries in the payload. In order to create, update, and delete nested entries, all nested entries must have `sys` field with and a `fields` object with at least one field:

- `type` set to `Entry`
- `contentType` set to `{ sys: { id: "CONTENT_TYPE_ID" }}`

For example, assuming an entry with a `title` field and an `author` field of the `post` content type, that links to an "Author Entry" based on an Author content type:

```
const entry_to_create = {
  sys: {
    type: "Entry",
    contentType: {
      sys: { id: "post" }
    }
  },
  fields: {
    title: "Example title",
    author: {
      sys: {
        type: "Entry",
        contentType: {
          sys: { id: "author" }
        }
      },
      fields: {
        firstName: "John",
        lastName: "Appleseed",
        title: "Staff writer"
      }
    }
  }
}
const contentful = cms.api.contentful

contentful.createEntry('page', entry_to_create, { locale: "en", references: true })
  .then(entry => console.log(entry))
  .catch(error => console.error(error))
```
