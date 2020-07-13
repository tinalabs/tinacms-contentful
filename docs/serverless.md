# Serverless

The following outlines how the serverless approaches works, and how to set it up with your application.

### Add the provider to your application

Add the root `TinacmsContentfulProvider` component to our main layout. This provider handles managing all of the state for contentful in Tina and your application.

1. We will supply it with handlers for authenticating and entering/exiting edit-mode.

```tsx
// YourLayout.ts
import { TinacmsContentfulProvider, toggleEditMode } from 'react-tinacms-contentful';

const enterEditMode = () => toggleEditMode(true);
const exitEditMode = () => toggleEditMode(false);

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