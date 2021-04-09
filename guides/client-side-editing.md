<!-- no toc -->
# Client-side Editing with OAuth User Authentication

This guide covers how you can setup TinaCMS to handle CRUD from Contentful in your application when the CMS is enabled.

We will cover how to do the following in plain JavaScript, React, or on the server:

- [Client-side Editing with OAuth User Authentication](#client-side-editing-with-oauth-user-authentication)
  - [Pre-requisites](#pre-requisites)
  - [Creating Your First Entry](#creating-your-first-entry)
  - [Updating Your Entry](#updating-your-entry)
  - [Publishing Your Entry](#publishing-your-entry)
  - [Uploading Your First Asset](#uploading-your-first-asset)
  - [Making an entry editable by editors in the CMS](#making-an-entry-editable-by-editors-in-the-cms)

## Pre-requisites

To follow this guide, the following is expected:

- You have a working application with TinaCMS already setup with Contentful. If not, [please follow the docs to add Contentful to a TinaCMS site](https://github.com/tinalabs/tinacms-contentful/blob/master/README.md#quick-start).
- You have setup [OAuth applications with Contentful](https://www.contentful.com/developers/docs/extensibility/oauth/) if you plan to have your users authenticate with Contentful.
- You have a space with Content Models and Entries ready to use, and have setup [delivery and preview API access tokens](https://www.contentful.com/developers/docs/references/authentication#api-keys-in-the-contentful-web-app) and have them readily available.

## Creating Your First Entry

The simplest first step for editing content in Contentful with Tina is to create a new entry. To do so, you'll need:

- The `id` of the entries "Content Type".
- An object with field data you want to create the entry with

Then, you can grab the Contentful Client off the CMS and use the `createEntry` method to create your entry:

```
const contentful = cms.api.contentful
const contentType = "CONTENT_TYPE_ID"
const fields = {
  title: "Example Entry from TinaCMS"
}

contentful.createEntry(contentType, fields)
  .then(entry => {
    console.log(entry)
    cms.alerts.success("Created entry: " + fields.title)
  })
  .catch(error => {
    console.log(error)
    cms.alerts.success("Failed to created entry: " + fields.title)
  })
```

## Updating Your Entry

Now that you've created an entry with Tina, you can try updating it. To do so, you'll need:

- The `id` of the entry you just created
- The `id` of the locale you want to create the entry in
- An object with updated field data you want to update the entry with

Then, you can grab the Contentful Client off the CMS and use the `updateEntry` method to update your entry:

```
const contentful = cms.api.contentful
const entryId = "ENTRY_ID"
const fields = {
  title: "Updated Example Entry from TinaCMS"
}

contentful.updateEntry(entryId, fields, { locale: "en" })
  .then(entry => {
    console.log(entry)
    cms.alerts.success("Updated entry: " + fields.title)
  })
  .catch(error => {
    console.log(error)
    cms.alerts.success("Failed to update entry: " + fields.title)
  })
```

## Publishing Your Entry

Lastly, to make your new entry available to the public, you need to publish it. To do so, you'll need:

- The `id` of the entry you just created
- The `id` of the locale you want to update the entry in

Then, you can grab the Contentful Client off the CMS and use the `publishEntry` method to update your entry:

```
const contentful = cms.api.contentful
const entryId = "ENTRY_ID"

contentful.publishEntry(entryId)
  .then(() => cms.alerts.success("Published entry"))
  .catch(error => {
    console.log(error)
    cms.alerts.success("Failed to publish entry: " + fields.title)
  })
```

You can also unpublish, archive, and delete entries. See the [API docs for more information](https://tinalabs.github.io/tinacms-contentful/classes/contentfulclient.html).

## Uploading Your First Asset

You can upload a file to Contentful as a new asset, or update an existing asset with a new file, by using the "File Upload" API. To do so, you'll need:

- A file upload from the browser, either from the media manager, a custom file input, or some other source as a public URL to download from or an `ArrayBuffer` of the file contents.
- The `id` of the locale you want to create or update the asset in

```
const contentful = cms.api.contentful
const fields = {
  title: "Example Image",
  description: "New example image asset from TinaCMS",
  file: {
    contentType: "text/image",
    file: "https://example.com/example.jpg",
    fileName: "example.jpg"
  }
}

contentful.createAsset(fields, { locale: "en" })
  .then(asset => {
    console.log(asset)
    cms.alerts.success("Created asset: " + fields.title)
  })
  .catch(error => {
    console.log(error)
    cms.alerts.success("Failed to created entry: " + fields.title)
  })
```

## Making an entry editable by editors in the CMS

Last, but certainly not least, you'll definitely want to present forms in the TinaCMS sidebar or via inline editing for your users to edit your entries in the context of your page and application. (That's the whole point of Tina, duh! 🦙).

You can do this by fetching an entry, using it to create a TinaCMS form, and registering that form with the CMS as a form plugin.

**Vanilla JS**
```
const contentful = cms.api.contentful
const form = new Form({
  id: "example-form",
  label: "Edit Entry",
  fields: [
    { name: "fields.title", label: "Title", component: "text" }
  ],
  onSubmit: (values) => {
    contentful.updateEntry(values.sys.id, values, { locale: "en" })
  },
  loadInitialValues: contentful.getEntry('ENTRY_ID', {
    mode: "preview"
  })
})

cms.plugins.add(form)
```

**React**:
```
import React from 'react'
import { useContentfulEntryForm } from 'react-tinacms-contentful'

const MyEntry = ({ entry }) => {
  const [modifiedEntry, form] = useContentfulEntryForm(entry, {
    locale: "en",
    autosave: false,
    publishOnSave: false,
    buttons: {
      publish: false,
      unpublish: false,
      archive: false
    }
  })
}
```

You can also enable the following:

- Autosaving, by setting `autosave` to `true` or the number of seconds of inactivity to wait before autosaving.
- Publish on save, by setting `publishOnSave` to `true`
- A publish/publish all button by setting `buttons.publish` to `true`
- An unpublish/unpublish all button by setting `buttons.unpublish` to `true`
- A archive/archive all button by setting `buttons.publish` to `true`