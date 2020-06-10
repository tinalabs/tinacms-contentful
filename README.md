# react-tinacms-contentful

This package provides helpers for setting up TinaCMS to use the Contentful API, with Contentful authentication.

## Installation

```
npm install --save react-tinacms-contentful
```

or

```
yarn add react-tinacms-contentful
```

## Getting Started

### Register the ContentfulClient

We will want to use the contentfulClient to load/save our content using the Contentful API. Let's add it as an API plugin.

```ts
import { TinaCMS } from 'tinacms';
import { contentfulClient } from 'react-tinacms-contentful';

const REPO_FULL_NAME = process.env.REPO_FULL_NAME; // e.g: tinacms/tinacms.org

const redirectUrl = process.env.CONTENTFUL_AUTH_REDIRECT_URL; //https://localhost:3000/contentful/authorizing

const cms = new TinaCMS({
  apis: {
    contentful: new ContentfulClient({
      clientId: process.env.CONTENTFUL_CLIENT_ID,
      redirectUrl: redirectUrl,
      space: process.env.CONTENTFUL_SPACE_ID,
      proxy: '/api/proxy',
    }),
  },
  // ... any other tina config
});
```

### Managing "edit-mode" state

Add the root `TinacmsContentfulProvider` component to our main layout. We will supply it with handlers for authenticating and entering/exiting edit-mode.
In this case, we will hit our `/api` server functions.

```tsx
// YourLayout.ts
import { TinacmsContentfulProvider } from 'react-tinacms-contentful';

const enterEditMode = () => {
  return fetch(`/api/preview`).then(() => {
    window.location.href = window.location.pathname; //refresh in edit-mode
  });
};
const exitEditMode = () => {
  return fetch(`/api/reset-preview`).then(() => {
    window.location.reload();
  });
};

const YourLayout = ({ editMode, error, children }) => {
  return (
    <TinaContentfulProvider
      editMode={pageProps.preview}
      enterEditMode={enterEditMode}
      exitEditMode={exitEditMode}
    >
      {children}
    </TinaContentfulProvider>
  );
};
```

### Auth Redirects

We will also need a few Contentful Specific pages to redirect the user to while authenticating with Contentful

```tsx
//pages/contentful/authorizing.tsx
// Our Contentful app redirects back to this page with auth token
import { useContentfulAuthRedirect } from 'react-tinacms-contentful';

export default function Authorizing() {
  // Let the main app know, that we receieved an auth token from the Contentful redirect
  useContentfulAuthRedirect();
  return <h2>Authorizing with Contentful, Please wait...</h2>;
}
```

### Entering / Exiting "edit-mode"

We will need a way to enter/exit mode from our site. Let's create an "Edit Link" button. Ours will take `isEditing` as a parameter.

_If you are using Next.js's [preview-mode](https://nextjs.org/docs/advanced-features/preview-mode) for the editing environment, this `isEditing` value might get sent from your getStaticProps function._

```tsx
//...EditLink.tsx
import { useContentfulEditing } from 'react-tinacms-contentful';

export interface EditLinkProps {
  isEditing: boolean;
}

export const EditLink = ({ isEditing }: EditLinkProps) => {
  const contentful = useContentfulEditing();

  return (
    <button
      onClick={isEditing ? contentful.exitEditMode : contentful.enterEditMode}
    >
      {isEditing ? 'Exit Edit Mode' : 'Edit This Site'}
    </button>
  );
};
```

### Contentful Oauth App:

In Contentful, you will need to [create an OAuth app](https://app.contentful.com/account/profile/developers/applications) through Contentful's settings.

Once you have done so, you can use the Client ID value to create the ContentfulClient.

# NextJS implementation:

TODO - this should eventually be moved to its own package

This section provides helpers for managing the github auth token for requests, as well as
providing helpers for loading content from the Github API.

## Getting Started

Any functions in the `pages/api` directory are are mapped to `/api/*` endpoints.

### `preview`

Helper for creating a `preview` server function, to kick off NextJS preview move with your auth token

```
export const previewHandler = (req, res) => {
  const previewData = {
    contentful_auth_token: req.cookies["contentful_auth_token"],
  };
  res.setPreviewData(previewData);
  res.status(200).end();
};

export default previewHandler;

```

### `proxy`

Proxies requests to Contentful API, attaching the appropriate access token in the process

```
const axios = require("axios");

const proxy = (req: any, res: any) => {
  const { headers, ...data } = JSON.parse(req.body);

  const authToken = data.url.includes("api.contentful.com")
    ? process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN
    : process.env.CONTENTFUL_PREVIEW_API_TOKEN;
  axios({
    ...data,
    headers: {
      ...headers,
      Authorization: "Bearer " + authToken,
    },
  })
    .then((resp: any) => {
      res.status(resp.status).json(resp.data);
    })
    .catch((err: any) => {
      res.status(err.response.status).json(err.response.data);
    });
};

export default proxy
```

Note that these CONTENTFUL_MANAGEMENT_ACCESS_TOKEN & CONTENTFUL_PREVIEW_API_TOKEN will need to be generated separetly through the Contentful UI.

# Form implementation

If your site uses links, we recommend using the ContentfulClient's `fetchFullEntry` function. It automatically resolves the nested links and attaches a version number.

import {
setCachedFormData,
} from "@tinacms/react-tinacms-contentful";

```
  const loadInitialValues = async () => {
    const entry = await cms.api.contentful.fetchFullEntry(page.sys.id);

    setCachedFormData(id, {
      version: entry.sys.version,
    });

    return entry.fields;
  }
```

You can see that the file's version gets saved to local storage. We'll use that value below when we save the content.

```
  const formConfig = {
    id: page.fields.slug,
    label: page.fields.title,
    loadInitialValues,
    onSubmit: async (values) => {

      //Let's map the data back to the format that the Management API expects
      const localizedValues = mapLocalizedValues(values, "en-US");

      cms.api.contentful
        .save(id, getCachedFormData(id).version, contentType, localizedValues)
        .then(function (response) {
          return response.json();
        })
        .then((data) => {
          setCachedFormData(id, {
            version: data.sys.version,
          });
        });
    },
    fields: [
      // ...
    ],
  };

  const [pageData, form] = useForm(formConfig);

  usePlugin(form);
```

# Development

## TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

### `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### Linking for local development

If you are want to test local changes to `react-tinacms-contentful`, we recommend using webpack aliases rather than using npm/yarn link.

On a NextJS site, your next.config.js may look like:

```
const path = require("path");

const tinaWebpackHelpers = require("@tinacms/webpack-helpers");

module.exports = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.alias["@tinacms/react-tinacms-contentful"] = path.resolve(
        "../react-tinacms-contentful"
      );
      config.resolve.alias["react-beautiful-dnd"] = path.resolve(
        "./node_modules/react-beautiful-dnd"
      );

      tinaWebpackHelpers.aliasTinaDev(config, "../tinacms");
    }

    return config;
  },
  // ...
};
```
