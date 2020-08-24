import { useContext } from 'react'
import { ContentfulEditingContext } from '../providers/ContentfulEditingContextProvider'

export function useContentfulEditing() {
  return useContext(ContentfulEditingContext)
}
