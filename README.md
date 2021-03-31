# react-tinacms-contentful

This package provides helpers for setting up TinaCMS to use the Contentful API as well as user authentication with Contentful.

## Pre-requisites

To use this plugin, the following is expected:

- You have a working application with [TinaCMS already setup](https://tinacms.org/docs/cms)
- You have setup [OAuth applications with Contentful](./docs/oauth.md) if you plan to have your users authenticate with Contentful

## Quick Start

To get up and running quickly, follow the instructions for your tech stack:

- [Vanilla JS](./packages/tinacms-contentful/README.md)
- [React](./packages/react-tinacms-contentful/README.md)
- [Next.js](./packages/next-tinacms-contentful/README.md)

## Guides

There are three different approaches to using Contentful with TinaCMS, depending on your application's configuration:

1. [*Client-side with OAuth user authentication*](./guides/client-side.md), which allows users of your Contentful organization to login to their account to edit the content with Tina that they are allowed to access in Contentful.
2. [*Serverless with Oauth user authentication*](./guides/serverless.md), which allows you to access the delivery API or preview API to build your application or preview draft content, and the management API to write changes back to contentful as the system instead of as a user.
3. [*Updating entries with nested references*](./guides/entries-with-references.md), which allows you to build complex data structures using Contentful Link fields and edit them with a single TinaCMS form.
