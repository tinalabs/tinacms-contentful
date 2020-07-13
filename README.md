# react-tinacms-contentful

This package provides helpers for setting up TinaCMS to use the Contentful API as well as user authentication with Contentful.

## Pre-requisites

To use this plugin, the following is expected:

- You have a working application with TinaCMS already setup
- You have setup [OAuth applications with Contentful](./docs/oauth.md) if you plan to have your users authenticate with Contentful

## Installation

```
npm install --save react-tinacms-contentful contentful contentful-management
# or
yarn add react-tinacms-contentful contentful contentful-management
```

## Getting started

There are three different ways to use Contentful with TinaCMS, depending on your application's configuration:

1. [*Client-side with user authentication*](./docs/client-side.md), which allows users of your Contentful organization to login to their account to edit the content they are allowed to access
1. [*Serverless with user authentication*](./docs/serverless.md#user-authentication), which allows users of your Contentful organization to login to their account to edit the content they are allowed to access, but provides additional security through HTTP-ONLY cookies.
1. [*Serverless with access-token-based authentication*](./docs/serverless.md#accesss-token-authentication), which allows you to setup your own rules for accessing the editing of the site






