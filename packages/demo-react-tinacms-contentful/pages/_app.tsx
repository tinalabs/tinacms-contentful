import React from "react";
import {MDXProvider} from '@mdx-js/react'
import {CodeBlock} from 'tinacms-doc-toolkit'
import 'bulma/css/bulma.min.css';
import '../styles/index.css'

const components = {
  pre: (props: any) => {
    console.log(props);
    
    return (
      <div {...props}>
        {props.children}
      </div>
    )
  },
  code: CodeBlock
}

export function MyApp({ Component, pageProps }: any) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}

export default MyApp