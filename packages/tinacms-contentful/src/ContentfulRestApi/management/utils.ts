import { ContentType } from 'contentful'
import { v4 } from 'uuid'
import { getFieldsWithReferences } from './locale'
import { Entry, GraphOptions, Operation, OperationsGraph } from './operationsGraph'

export const isEntry = (entry: Entry<any>) => typeof entry?.sys !== "undefined" && entry?.sys?.type === "Entry"
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
      let isReference = false

      if (fieldDefinition?.type === "Link") {
        isReference = true
      } else if (Array.isArray(field)) {
        isReference = isEntries(field)
      } else {
        isReference = isEntry(field)
      }
      return isReference
    })
}

/**
 * Filters an entry's fields down to its references, and adds an ID to references without one
 * 
 * @param entry The entry whose references to resolve (if any).
 * @param fieldName The fieldName currently being checked
 * @returns A reference with an id or null
 */
export const addReferenceId = (entry: Entry<any> | null, fieldName: string) => {
  let field = entry?.fields?.[fieldName]
  if (!field || !entry) return null
  
  const isArray = Array.isArray(field)
  const items = isArray ? field : [field]
  
  items.forEach((item: any, idx: number) => {
    const itemId = v4()
    item = {
      ...item,
      sys: {
        ...item.sys,
        id: itemId
      }
    }
    
    if (isArray) {
      entry.fields[fieldName][idx] = item
      field[idx] = {...item}
    } else  {
      entry.fields[fieldName] = item
      field = {...item}
    }
    
  })
  
  return field
}

/**
 * Compares initial state to updated state and decides if a create, update, or dereference operation
 * 
 * @param initial Initial state of entry
 * @param updated Updated state of entry
 * @param options Graph options
 * @returns An operation or null if no operation is necessary
 */
export const createContentfulOperation = (initial: Entry<any> | null, updated: Entry<any> | null, options?: GraphOptions): Operation | null => {
  const isDereference = initial !== null && updated === null;
  const isCreate = initial === null && updated !== null;
  const isChange = initial && hasChanged(initial, updated) || false;
  
  if (updated && isCreate) {
    const fieldsWithReferences = getFieldsWithReferences(
      updated.fields, options?.contentType
    );
    
    return {
      type: "create",
      sys: updated.sys,
      fields: fieldsWithReferences
    } as Operation<"create">
  }
  else if (updated && isChange) {
    const fieldsWithReferences = getFieldsWithReferences(
      updated.fields, options?.contentType
    );

    return {
      type: "update",
      sys: updated.sys,
      fields: fieldsWithReferences
    } as Operation<"update">
  }
  else if (initial && isDereference) {
    return {
      type: "dereference",
      sys: initial.sys
    } as Operation<"dereference">
  }  

  return null
}