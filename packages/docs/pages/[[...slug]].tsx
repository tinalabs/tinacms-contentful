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

const Heading = ({ as, text }) => {
  const H = as || 'h1'
  const id = typeof text === "string"
    ? text
      .replace(/[!@#$%^&*()?'`]/gm, '')
      .replace(/[ ]{1,}/gm, '-')
      .toLowerCase()
    : ""

  return <H id={id}>{text}</H>
}

const components = {
  h1: ({children}: any) => <Heading as="h1" text={children} />,
  h2: ({children}: any) => <Heading as="h2" text={children} />,
  h3: ({children}: any) => <Heading as="h3" text={children} />,
  h4: ({children}: any) => <Heading as="h4" text={children} />,
  pre: (props: any) => {
    return <pre {...props} />
  },
  code: ({className, children}: any) => {
    return <CodeBlock className={["code", className].join(" ")}>
      {children}
    </CodeBlock>
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Config.pages.map(page => ({
    params: {
      slug: [page.slug.replace(/^\//, '')]
    }
  }))

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