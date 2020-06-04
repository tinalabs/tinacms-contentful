import React from 'react'

import { ContentfulEditingContext } from './ContentfulEditingContext'

export function useContentfulEditing() {
  return React.useContext(ContentfulEditingContext)
}
