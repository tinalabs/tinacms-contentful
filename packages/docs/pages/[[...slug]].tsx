import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import {CodeBlock} from 'tinacms-doc-toolkit'
import {useRouter} from 'next/router'
import { Layout, Loader } from 'tinacms-doc-toolkit'
import Config from '../tina-demo.config'
import { GetStaticPaths, GetStaticProps } from 'next'


export function SlugHandler() {
  const router = useRouter()
  const slug = typeof router.query.slug == 'undefined' ? "/" : router.query.slug 
  const currentSlug = Array.isArray(slug) ? slug.join("/") : slug;

  if (router.isFallback) {
    return <Loader />
  }

  return (
    <MDXProvider components={components}>
      <Layout currentSlug={currentSlug} config={Config}>
        <Loader />
      </Layout>
    </MDXProvider>
  )
}


const components = {
  pre: (props: any) => {
    return <pre {...props} />
  },
  code: (props: any) => {
    return <code {...props} />
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Config.pages.map(page => ({
    params: {
      slug: [page.slug.replace(/^\//, '')]
    }
  }))

  console.log(paths)

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
  console.log(params)

  return {
    props: {}
  }
}



export default SlugHandler;