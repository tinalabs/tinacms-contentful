# Client-side and serverless editing with Oauth user authentication with Next.js Edit Mode

This guide covers how you can setup TinaCMS to handle CRUD (creates, reads, updates, and deletes) with Contentful in your application when the CMS is enabled, both on the client and the server using [edit mode](./).

We will cover how to do the following in plain JavaScript, React, or on the server:

- [Client-side and serverless editing with Oauth user authentication with Next.js Edit Mode](#client-side-and-serverless-editing-with-oauth-user-authentication-with-nextjs-edit-mode)
  - [Setup](#setup)
    - [Installation](#installation)
    - [Edit Mode](#edit-mode)
  - [Managing Content As A User On The Client](#managing-content-as-a-user-on-the-client)
    - [Fetching Content](#fetching-content)
    - [Editing Content](#editing-content)
      - [Creating An Entry](#creating-an-entry)
      - [Updating An Entry](#updating-an-entry)
      - [Deleting An Entry](#deleting-an-entry)
  - [Managing Content As A User On The Server](#managing-content-as-a-user-on-the-server)
    - [Server-side Bearer Tokens](#server-side-bearer-tokens)


## Setup

### Installation

To install the packages, run:

```
npm install next-tinacms-contentful react-tinacms-contentful tinacms-contentful contentful contentful-management
```

### Edit Mode

Follow the [edit mode](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/index.html#edit-mode) setup guide, and then continue below.

## Managing Content As A User On The Client

Once you have [Edit Mode](#edit-mode) setup, you can then start making requests in your client-side React code.

### Fetching Content

The most basic request you can make is fetching published or unpublished (draft) content, such as fetching a list of entries based on user input in a form. This can be done using the `useContentfulEntry` and `useContentfulEntries` hooks:


```
import React, { useEffect } from 'react'
import { useContentfulEntry, useContentfulEntries } from 'next-tinacms-contentful'

const DynamicEntry = ({ entryId, draft }) => {
  const [entry, loading, error] = useContentfulEntry(query, {
    mode: draft ? "preview" : "delivery"
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div>
        <h2>Something went wrong...</div>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <article>
      <h2>{entry.fields.title}</h2>
      <p>{entry.sys.id}</p>
    </article>
  )
}

const MyEntriesList = ({ query, draft }) => {
  const [entries, loading, error] = useContentfulEntries(query, {
    mode: draft ? "preview" : "delivery"
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div>
        <h2>Something went wrong...</div>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <ol>
      {entries.length === 0 && "No entries found"}
      {entries.map(entry => (
        <li>{entry.sys.id}</li>
      ))}
    </ol>
  )
}
```

### Editing Content

You can also create, update, and delete entries and assets in your code when the CMS is enabled on behalf of the logged in user. The most straight-forward version of this is creating forms that allow editing of existing Contentful Entries and Assets using the `useContentfulEntryForm` and `useContentfulEntriesForm` hooks. 

> **Heads up**
>
> `useContentfulEntryForm` and `useContentfulEntriesForm` both return the modified entry/entries with the updated fields from the form, and a form object that can be registered as a CMS plugin or used with `InlineForm` to create a custom form UI in your application for logged in editors.

```
const ExampleEntry = ({ fields, sys }) => (
  <article>
    <h2>{fields.title}</h2>
    <p>{sys.id}</p>
  </article>
)

const EditableExampleEntry = ({ entry }) => {
  const [modifiedExample, form] = useContentfulEntryForm(entry, {
    locale: "en",
    autosave: false,
    publishOnSave: false
  })

  usePlugin(form)

  return (
    <ExampleEntry {...entry} />
  )
}

const EditableExampleEntries = ({ entries }) => {
  const [modifiedExampleEntries, form] = useContentfulEntriesForm(entries, {
    locale: "en",
    autosave: false,
    publishOnSave: false
  })

  usePlugin(form)

  return (
    <ul>
      {modifiedExampleEntries.map(entry => (
        <li><ExampleEntry {...entry} /></li>
      ))}
    </ul>
  )
}
```

The other way is to use an instance of the `ContentfulClient` to create, update, or delete entries (and assets) programatically on behalf of the logged in user:

#### Creating An Entry

To create an entry, you can run `createEntry` on the `ContentfulClient` returned by `useContentful`:

```
const CreateEntryForm = () => {
  const contentful = useContentful()
  const onSubmit = useCallback((event) => {
    const values = new FormValues(event.target)
    const title = values.get('title')

    event.preventDefault()
    contentful.createEntry({ title }, { locale: "en" })
      .then((entry) => cms.alerts.success("Created entry: " + title))
      .catch((err) => {
        console.error(error)
        cms.alerts.error("Failed to create entry: " + title)
      })
  }, [contentful])

  return (
    <form onSubmit=>
      <input type="text" name="title" placeholder="Enter a title..." />
      <button type="submit">Create Entry</button>
    </form>
  )
}
```

#### Updating An Entry

To create an entry, you can run `updateEntry` on the `ContentfulClient` returned by `useContentful`:

```
const UpdateEntryForm = ({ entryId }) => {
  const contentful = useContentful()
  const onSubmit = useCallback((event) => {
    const values = new FormValues(event.target)
    const title = values.get('title')

    event.preventDefault()
    contentful.updateEntry(entryId, { title }, { locale: "en" })
      .then((entry) => cms.alerts.success("Updated entry: " + title))
      .catch((err) => {
        console.error(error)
        cms.alerts.error("Failed to update entry: " + title)
      })
  }, [contentful])

  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="title" placeholder="Enter a title..." />
      <button type="submit">Update Entry</button>
    </form>
  )
}
```

#### Deleting An Entry

To create an entry, you can run `deleteEntry` on the `ContentfulClient` returned by `useContentful`:

```
const DeleteEntryForm = ({ entryId }) => {
  const cms = useCMS()
  const contentful = useContentful()
  const onSubmit = useCallback((event) => {
    const values = new FormValues(event.target)
    const entryId = values.get('entryId')

    event.preventDefault()
    contentful.deleteEntry(entryId)
      .then(() => cms.alerts.success("Deleted entry"))
      .catch((err) => {
        console.error(error)
        cms.alerts.error("Failed to delete entry...")
      })
  }, [contentful])

  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="entryId" placeholder="Enter a title..." />
      <button type="submit">Update Entry</button>
    </form>
  )
}
```

This approach is useful for things like:

- Custom toolbar widgets
- Custom screen plugins
- Custom application admin UI for logged in users

## Managing Content As A User On The Server

You can also use server-side logic in Next.js [Edit Mode](#edit-mode) to read and edit Content in `getStaticProps`, `getServerSideProps`, and Next.js API functions when the current user is logged in.

You can currently:

- [Fetch entries](#fetching-entries-on-the-server)
- Get access to the users Oauth bearer token for using the Contentful Management SDK on behalf of the user

### Server-side Bearer Tokens

The currently logged in user's bearer token is securely availble in server-side logic inside Next.js server-side context's `previewData` as `context.previewData.contentful_bearer_token`. You can use this to create an instance of the Contentful Management SDK and make requests on behalf of the current user.

E.g., with the Delivery SDK:

```
import { createClient } from 'contentful'

export const getStaticProps = async (context) => {
  try {
    let token = context.preview && context.previewData.contentful_bearer_token 
      ? context.previewData.contentful_bearer_token 
      : process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_ACCESS_TOKEN;
    const contentful = createClient({
      space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE,
      accessToken: token
    })
    
    return await contentful.getEntry('ENTRY_ID')
  }
  catch (error) {
    return {
      notFound: true
    }
  }  
}
```

Or, with the Management SDK in an API route:

```
export const apiHandler = (req, res) => {
  try {
      const context = req.context;
      let token = context.preview && context.previewData.contentful_bearer_token 
        ? context.previewData.contentful_bearer_token 
        : process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_ACCESS_TOKEN;
      const contentful = createClient({
        space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE,
        accessToken: token
      })
      const entry =  await contentful.getEntry('ENTRY_ID')
      
      // Do something, like update the entry
      entry.fields = JSON.parse(req.body
      
      await entry.update()
      
      res.status(200).end()
    }
    catch (error) {
      req.status(500).send(error.message)
    }
}
```
