# react-tinacms-contentful

This package provides helpers for setting up TinaCMS to use the Contentful API as well as user authentication with Contentful.

## Pre-requisites

To use this plugin, the following is expected:

- You have a working application with [TinaCMS already setup](https://tinacms.org/docs/cms)
- You have setup [OAuth applications with Contentful](https://www.contentful.com/developers/docs/extensibility/oauth/) if you plan to have your users authenticate with Contentful
- You have a space with Content Models and Entries ready to use

## Quick Start

To get up and running quickly, follow the instructions for your tech stack:

- [`tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/): plain Javascript APIs for client-side javascript.
- [`react-tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/): React-specific APIs.
- [`next-tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/): Next.js-specific APIs.

## Guides

There are three different approaches to using Contentful with TinaCMS, depending on your application's configuration:

1. [*Client-side with READ-only access tokens*](./guides/client-side.md), allowing you to fetch entries, assets, and other data from Contentful's API in your client-side JS.
2. [*Client-side editing with OAuth user authentication*](./guides/client-side-editing.md), which allows users of your Contentful organization to login to their account to edit the content with Tina that they are allowed to access in Contentful.
3. [*Client-side and serverless editing with Oauth user authentication*](./guides/serverless-editing.md), which allows you to maintain server-side sessions for logged in users across multiple tabs.

There are also the following use-case specific guides:

1. [*Creating entries*](./guides/creating-entries.md), using a TinaCMS content creator to allow new entries to be created inside the CMS.
2. [*Updating entries with references*](./guides/entries-with-references.md), which allows you to build complex data structures using Contentful Link fields and edit them with a single TinaCMS form.
3. [*Adding new features to the CMS using Contentful*](./guides/plugins.md), such as adding toolbar widgets, screen plugins, custom fields, and custom form actions.

## Roadmap

The following is a series of things _we would like to add_ or are _considering adding_ to the plugins, if time and resources submits:

- The ability to create, update, and delete content models as the user using the `ContentfulClient` and in TinaCMS sidebar and toolbar as forms/content creators/screen plugin(s).
- The ability to manage media from multiple spaces at one time