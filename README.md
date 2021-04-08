# react-tinacms-contentful

This package provides helpers for setting up TinaCMS to use the Contentful API as well as user authentication with Contentful.

## Pre-requisites

To use this plugin, the following is expected:

- You have a working application with [TinaCMS already setup](https://tinacms.org/docs/cms)
- You have setup [OAuth applications with Contentful](./docs/oauth.md) if you plan to have your users authenticate with Contentful

## Quick Start

To get up and running quickly, follow the instructions for your tech stack:

- [`tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/): plain Javascript APIs for client-side javascript.
- [`react-tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/react-tinacms-contentful/): React-specific APIs.
- [`next-tinacms-contentful`](https://tinalabs.github.io/tinacms-contentful/next-tinacms-contentful/): Next.js-specific APIs.

## Guides

There are three different approaches to using Contentful with TinaCMS, depending on your application's configuration:

1. [*Client-side with READ-only access tokens*](./guides/client-side.md), allowing you to fetch entries, assets, and other data from Contentful's API in your client-side JS.
2. [*Client-side editing with OAuth user authentication*](./guides/client-side-editing.md), which allows users of your Contentful organization to login to their account to edit the content with Tina that they are allowed to access in Contentful, and allow you to perform CRUD operations on their behalf.
3. [*Client-side and serverless editing with Oauth user authentication with Next.js Edit Mode*](./guides/serverless-editing.md), which allows you to maintain server-side sessions for logged in users across multiple tabs in your Next.js application, and manage content in Contentful in API functions, `getStaticProps`, and `getServerSideProps`.

There are also the following use-case specific guides:

1. [*Updating entries with references*](./guides/entries-with-references.md), which allows you to build complex data structures using Contentful Link fields and edit them with a single TinaCMS form.
2. [*Adding new features to the CMS using Contentful*](./guides/plugins.md), such as adding toolbar widgets, screen plugins, custom fields, and custom form actions.
