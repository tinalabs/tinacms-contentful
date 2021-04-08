# Client-side and serverless editing with Oauth user authentication with Next.js Edit Mode

This guide covers how you can setup TinaCMS to handle CRUD from Contentful in your application when the CMS is enabled on the client and the server using [edit mode](./).

We will cover how to do the following in plain JavaScript, React, or on the server:

- [Client-side and serverless editing with Oauth user authentication with Next.js Edit Mode](#client-side-and-serverless-editing-with-oauth-user-authentication-with-nextjs-edit-mode)
  - [Setup](#setup)
  - [Managing Content As A User On The Client](#managing-content-as-a-user-on-the-client)
  - [Managing Content As A User On The Server](#managing-content-as-a-user-on-the-server)


## Setup

- Next.js setup guide
- Setup Edit Mode

## Managing Content As A User On The Client

- Once the CMS is enabled, you can make requests using an instance of the `ContentfulClient` on behalf of the logged in user:
  - Sending data through TinaCMS UI using form plugins and client-side requests.
    - In React, you can also use form hooks to create editing interfaces in the CMS for your users that support publishing, unpublishing, and archiving.
  - Sending data through custom application UI using forms and client-side requests.

## Managing Content As A User On The Server

- Once the CMS is enabled, you can make requests using on behalf of the logged in user using the methods exported from `next-tinacms-contentful` and the bearer token stored in Next.js' preview data.
  - Sending data through custom application UI using forms and serverless functions.