# Next
<!-- TODO - this should eventually be moved to its own package -->

The following outlines how to set up your NextJS application with this package.

## Getting Started

### Setting up edit mode using Next's preview feature

Helper for creating a `editing` serverless function, to kick off NextJS preview mode with your contentful data and editing context.

```
export function editingHandler(req, res) {
  const previewData = {};
  
  res
    .setPreviewData(previewData);
    .status(200)
    .end();
};

export default previewHandler;

```

## Client-side

### User Authentication

TODO: explain authorization

## Serverless

### User Authentication

TODO: explain authorization

### Access Token Authentication

TODO: explain the `contentful` api endpoint.