import React from "react";
import { useRouter } from 'next/router'
import { Layout } from 'tinacms-doc-toolkit'
import Config from '../tina.config'

export const SlugPage = () => {
  const router = useRouter()
  const currentSlug = typeof router.query.slug == 'undefined' ? "" : router.query.slug 

  if (router.isFallback) {
      return <div>Loading...</div>
  }

  return <Layout currentSlug={'/' + currentSlug} config={Config} loadComponent={loadComponent}/>
}

export default SlugPage