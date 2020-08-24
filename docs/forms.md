# Forms

The following outlines how to setup TinaCMS forms that are powered by Contentful's API.

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

There are a few Tina fields available within this package.

They can be registered with your cms instance like so:

```
// _app.js

import { BlocksFieldPlugin } from "@tinacms/react-tinacms-contentful";

// ...
  const cms = React.useMemo(() => new TinaCMS(tinaConfig), []);
  cms.fields.add({
    name: "contentful-linked-field",
    Component: ContentfulLinkedSelectField,
  });
  cms.fields.add(BlocksFieldPlugin);
// ...
```

## `LinkedBlocks`

Similar to the [blocks field](https://tinacms.org/docs/fields/blocks) defined within Tina, except this field stores a list of references instead of defining the content inline.

Your field registration might look like:

```
      {
        name: "my-blocks-field",
        label: "My Blocks Fields",
        component: "linked-blocks",
        templates: blocks,
        getTemplateId: (block) => block.sys.contentType.sys.id,
      },
```

`getTemplateId`: function to return the block identifier, from the block object.

## `ContentfulLinkedSelectField`

TODO: ContentfulLinkedSelectField docs