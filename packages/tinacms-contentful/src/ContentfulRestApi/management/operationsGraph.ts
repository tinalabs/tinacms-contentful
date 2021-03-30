import { v4 } from 'uuid';
import { ContentType, ContentTypeLink, Sys } from "contentful";
import { getFieldsWithReferences } from "./locale";

export interface OperationsGraph {
  nodes: Operation[];
  edges: {
    [entryId: string]: string[];
  };
}

export type OperationType = "create" | "update" | "dereference";

export type Entry<EntryShape extends any> = {
  fields: EntryShape;
  sys: Partial<Sys> & {
    id: string,
    contentType: {
      sys: ContentTypeLink
    }
  };
}

type BaseOperation<Type = OperationType> = Entry<unknown> & {
  type: Type;
}

export type Operation<Type = OperationType> =
  Type extends "dereference"
  ? BaseOperation<"dereference"> & { fields: undefined }
  : BaseOperation<Type>


export type GraphOptions = {
  contentType?: ContentType
}

const isEntry = (entry: Entry<any>) => typeof entry.sys !== "undefined" && entry.sys.type === "Entry"
const isEntries = (entries: Entry<any>[]) => entries.findIndex && entries.findIndex(entry => isEntry(entry)) > -1
const hasNode = (operations: OperationsGraph, node: Entry<any>) => operations.nodes.findIndex(currentNode => currentNode.sys.id === node.sys?.id) > -1 || false

function hasChanged(initial: Entry<any> | null, updated: Entry<any> | null) {
  const a = JSON.stringify(initial?.fields) ?? false
  const b = JSON.stringify(updated?.fields) ?? true

  return a !== b;
}

const findReferenceKeys = (entry: Entry<any>, contentType?: ContentType) => {
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

const createContentfulOperation = (initial: Entry<any> | null, updated: Entry<any> | null, options?: GraphOptions): Operation | null => {
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

const createNode = (graph: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options?: GraphOptions) => {
  if (initial === null && updated === null) return;

  const operation = createContentfulOperation(initial, updated, options);
  if (operation !== null) {
    graph.nodes.push(operation)

    if (parent) {
      createEdge(graph, parent.sys.id, operation.sys.id)
    }
  }
}

const createEdge = (graph: OperationsGraph, from: string, to: string) => {
  if (!Array.isArray(graph.edges[from])) graph.edges[from] = [];

  graph.edges[from].push(to);

  return graph;
}

/**
 * Takes an initial and updated state of an entry, and computes a graph of the changes:
 * 
 * - nodes: the individual operations to run to update the delta
 * - edges: the relationships between operations, allowing different traversal paths
 * 
 * @param initial The initial state of the entry
 * @param updated The updated state of the entry
 * @param options 
 * @returns operations and the graph
 */
export const createContentfulOperationsForEntry = (initial: Entry<any> | null, updated: Entry<any> | null, options?: GraphOptions) => {
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  }
  const operations = _createContentfulOperationsForEntry(
    graph, initial, updated, null, options
  );
  
  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "dereference") as Operation<"dereference">[],
    graph: operations
  }
}

/**
 * Handles 3 cases:
 * - initial is defined, update is null (dereference)
 * - initial is null, update is defined (create)
 * - initial is defined, update is defined (update)
 * 
 * @param operations 
 * @param initial 
 * @param updated 
 * @param parent 
 * @param options 
 */
function _createContentfulOperationsForEntry(operations: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options?: GraphOptions) {
  const entry = typeof updated?.sys !== undefined ? updated : initial;
  const initialKeys = initial !== null ? findReferenceKeys(initial, options?.contentType) : [];
  const initialReferences = [].concat.apply([], initialKeys.map(childKey => {
    const item = initial?.fields[childKey]
    
    if ( !item || !item?.sys || !entry) return null
    if (!entry.fields[childKey].sys) return null
    const itemId = item?.sys?.id ?? v4()
    
    item.sys.id = itemId
    entry.fields[childKey].sys.id = itemId
    
    return item
  }))
    .filter(item => typeof item !== "undefined" && item !== null)
  const updatedKeys = updated !== null ? findReferenceKeys(updated, options?.contentType) : [];
  const updatedReferences = [].concat.apply([], updatedKeys.map(childKey => {
    const field = updated?.fields?.[childKey]
    
    if (!field || !entry) return null
    
    const isArray = Array.isArray(field)
    const items = isArray ? field : [field]

    items.forEach((item: any, idx: number) => {
      const itemId = item?.sys?.id ?? v4()
      
      item.sys.id = itemId
      
      if (isArray) {
        entry.fields[childKey][idx].sys.id = itemId
        field[idx].sys.id = itemId
      } else  {
        entry.fields[childKey].sys.id = itemId
        field.sys.id = itemId
      }
      
    })

    return field
  }))
    .filter(item => typeof item !== "undefined" && item !== null)
  if (entry && hasNode(operations, entry) === false) {
    createNode(operations, initial, updated, parent, options);
  }

  if (initialReferences.length > 0 || updatedReferences.length > 0) {
    return _createContentfulOperationsForEntries(operations, initialReferences, updatedReferences, entry, options)
  }

  return operations;
}

/**
 * Takes an initial and updated state of an array of entries, and computes a graph of the changes:
 * 
 * - nodes: the individual operations to run to update the delta
 * - edges: the relationships between operations, allowing different traversal paths
 * 
 * @param initial The initial state of the entry
 * @param updated The updated state of the entry
 * @param options 
 * @returns operations and the graph
 */
export const createContentfulOperationsForEntries = (initial: Entry<any>[], updated: Entry<any>[], parent: Entry<any> | null = null, options?: GraphOptions) => {
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  }
  const operations = _createContentfulOperationsForEntries(graph, initial, updated, parent, options);

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "dereference") as Operation<"dereference">[],
    graph: operations
  }
}

/**
 * Handles 3 cases:
 * - initial is defined, corresponding update exists in array (dereference)
 * - initial is null, updated is defined (create)
 * - initial is defined, corresponding update exists in array (update)
 * 
 * @param operations 
 * @param initial 
 * @param updated 
 * @param parent 
 * @param options 
 */
function _createContentfulOperationsForEntries(operations: OperationsGraph, initial: Entry<any>[], updated: Entry<any>[], parent: Entry<any> | null = null, options?: GraphOptions) {
  // Queue operations
  for (const updatedEntry of updated) {
    // If null, we've got a create
    const initialEntry = initial && initial.find(entry => (entry?.sys?.id === updatedEntry?.sys?.id) || false) || null

    if (initialEntry || updatedEntry) {
      _createContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  for (const initialEntry of initial) {
    // If null, we've got a dereference
    const updatedEntry = updated && updated.find(entry => (entry?.sys?.id === initialEntry?.sys?.id) || false) || null

    if (initialEntry || updatedEntry) {
      _createContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  return operations
}