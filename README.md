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

const cms = new TinaCMS({
  apis: {
    contentful: new ContentfulClient({
      clientId: process.env.CONTENTFUL_CLIENT_ID,
      redirectUrl: process.env.CONTENTFUL_AUTH_REDIRECT_URL,
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
    window.location.href = window.location.pathname;
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

In Contentful, you will need to create an OAuth app.

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

# Development

## TSDX Bootstrap

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

## Local Development

Below is a list of commands you will probably find useful.

### `npm start` or `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. TSDX has a special logger for you convenience. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab.

<img src="https://user-images.githubusercontent.com/4060187/52168303-574d3a00-26f6-11e9-9f3b-71dbec9ebfcb.gif" width="600" />

Your library will be rebuilt if you make edits.

### `npm run build` or `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

<img src="https://user-images.githubusercontent.com/4060187/52168322-a98e5b00-26f6-11e9-8cf6-222d716b75ef.gif" width="600" />

### `npm test` or `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.
