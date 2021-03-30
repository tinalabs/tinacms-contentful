import { ContentType } from 'contentful'
import { Entry, OperationsGraph } from './operationsGraph'

export const isEntry = (entry: Entry<any>) => typeof entry.sys !== "undefined" && entry.sys.type === "Entry"
export const isEntries = (entries: Entry<any>[]) => entries.findIndex && entries.findIndex(entry => isEntry(entry)) > -1
export const hasNode = (operations: OperationsGraph, node: Entry<any>) => operations.nodes.findIndex(currentNode => currentNode.sys.id === node.sys?.id) > -1 || false

export function hasChanged(initial: Entry<any> | null, updated: Entry<any> | null) {
  const a = JSON.stringify(initial?.fields) ?? false
  const b = JSON.stringify(updated?.fields) ?? true

  return a !== b;
}

/**
 * Finds which fields on an entry are references/links and converts them to the Link data structure
 * 
 * @param entry The entry to find references for
 * @param contentType Use a content type definition to find links (Optional)
 * @returns An array of field names that are references
 */
export const findReferenceKeys = (entry: Entry<any>, contentType?: ContentType) => {
  if (!entry) return [];

  return Object.keys(entry.fields)
    .filter(fieldName => {
      const field = entry.fields[fieldName]
      const fieldDefinition = contentType && contentType.fields.find(field => field.id === fieldName);
      const isReference = fieldDefinition?.type === "Link" || Array.isArray(field) ? isEntries(field) : isEntry(field)

      return isReference
    })
}