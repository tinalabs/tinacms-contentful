import React from 'react'

export interface ContentfulEditingProps {
  editMode: boolean
  enterEditMode: () => void
  exitEditMode: () => void
}

export const ContentfulEditingContext = React.createContext<ContentfulEditingProps | null>(
  null
)
