# Client Side

The following outlines how the client side approach works, and how to set it up with your application.

## Overview

To setup Tina and Contentful, we'll cover the following:

- Adding the `ContentfulClient` as an API to Tina and configuring it
- Adding the `TinaContentfulProvider` to your site and configuring it
- Setting up a page to fetch content from Contentful

For personal access token based authentication, we'll cover:

- Setting up a proxy to forward requests securely

And for OAuth user authentication we'll cover:

- Setting up a authorization workflow with OAuth

Finally, we'll cover:

- Configuring our site to manage an "editing mode"
- Setting up a page to edit content in Contentful

## Adding the `ContentfulClient` as an API to Tina and configuring it

TODO:

## Adding the `TinaContentfulProvider` to your site and configuring it

Add the root `TinacmsContentfulProvider` component to our root component. This provider handles managing all of the state for Contentful in Tina and your application.

1. We will supply it with handlers for authenticating and entering/exiting edit-mode.

```tsx
// YourLayout.ts
import { TinacmsContentfulProvider } from 'react-tinacms-Contentful';
import { toggleEditMode } from "./toggleEditMode";

export const YourApp = ({ isEditing, error, children }) => {
  const cms = React.useMemo(() => new TinaCMS())
  const enterEditMode = () => toggleEditMode(true);
  const exitEditMode = () => toggleEditMode(false);

  return (
    <TinaProvider cms={cms}>
    <TinaContentfulProvider
      isEditing={isEditing}
      enterEditMode={enterEditMode}
      exitEditMode={exitEditMode}
    >
      {children}
    </TinaContentfulProvider>
  );
};
```

## Configuring our site to manage an "editing mode"

TODO: 
- explain setting up a state variable that handles editing mode and passing it down
- explain setting up the editing button to change that variable

We will need a way to enter/exit mode from our site. Let's create an "Enter Edit Mode/Exit Edit Mode" button. Ours will take `isEditing` as a parameter.

_If you are using Next.js's [preview-mode](https://nextjs.org/docs/advanced-features/preview-mode) for the editing environment, this `isEditing` value might get sent from your getStaticProps function._

```tsx
//...EditLink.tsx
import { useContentfulEditing } from 'react-tinacms-Contentful';

export interface EditLinkProps {
  isEditing: boolean;
}

export const EditLink = ({ isEditing }: EditLinkProps) => {
  const Contentful = useContentfulEditing();

  return (
    <button
      onClick={isEditing ? Contentful.exitEditMode : Contentful.enterEditMode}
    >
      {isEditing ? 'Exit Edit Mode' : 'Edit This Site'}
    </button>
  );
};
```

## Setting up a page to fetch content from Contentful

TODO:

- Explain accessing the CMS api
- Explain using the delivery client

## OAuth User Authentication

TODO:
- explain the pros and cons

### Setting up a authorization workflow with OAuth

TODO:

## Personal Access-Token-Based Authentication

TODO:
- explain the pros and cons

### Setting up a proxy to forward requests securely

TODO:

- setting up an express/serverless app to own the token and forward the sdk request (via a axios proxy)


## Setting up a page to edit content in Contentful

TODO:

- adding a sidebar form
- adding inline editing