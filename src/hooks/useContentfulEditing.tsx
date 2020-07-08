import React from 'react'

import { ContentfulEditingContext } from '../providers/ContentfulEditingContext'

export function useContentfulEditing() {
  return React.useContext(ContentfulEditingContext)
}
