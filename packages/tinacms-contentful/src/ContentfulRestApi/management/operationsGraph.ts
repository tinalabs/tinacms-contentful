import { ContentTypeLink, Sys } from "contentful";
import { v4 } from 'uuid';

export interface OperationsGraph {
  nodes: Operation[];
  edges: {
    [entryId: string]: string[];
  };
}

export type OperationType = "create" | "update" | "delete";

export type Entry<EntryShape extends any> = {
  fields: EntryShape;
  sys: Partial<Sys> & {
    id: string,
    contentType: {
      sys: ContentTypeLink
    },
    locale: string
  };
}

type BaseOperation<Type = OperationType> = Entry<unknown> & {
  type: Type;
}

export type Operation<Type = OperationType> =
  Type extends "delete"
  ? BaseOperation<"delete"> & { fields: undefined }
  : BaseOperation<Type>


export type GraphOptions = {
  shouldDelete?: boolean;
  locale: string;
}

const isEntry = (entry: Entry<any>) => typeof entry.sys !== "undefined"
const isEntries = (entries: Entry<any>[]) => entries.filter(entry => isEntry(entry)).length > 0

function hasChanged(initial: Entry<any> | null, updated: Entry<any> | null) {
  const a = JSON.stringify(initial?.fields) ?? false
  const b = JSON.stringify(updated?.fields) ?? true

  return a !== b;
}

const findDereferenced = (initial: Entry<any>[], updated: Entry<any>[]) => {
  const initialIds = initial.map(entry => entry.sys?.id || null).filter(entry => entry !== null)
  const updatedIds = updated.map(entry => entry.sys?.id || null).filter(entry => entry !== null)
  const dereferencedIds = initialIds
    .filter(initialId => !updatedIds.includes(initialId))
  
  return [...initial].filter(entry => dereferencedIds.indexOf(entry.sys.id) !== -1)
}

const findReferenceKeys = (entry: Entry<any>) => {
  return Object.keys(entry.fields)
    .filter(fieldName => {
      const field = entry.fields[fieldName]
      const isReference = Array.isArray(field) ? isEntries(field) : isEntry(field)

      return isReference
    })
}

const createNode = (graph: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options: GraphOptions) => {  
  let operation: Operation;
  const childKeys = updated && findReferenceKeys(updated) || [];

  if (initial === null && updated === null) return;
  
  if (typeof initial === null || typeof initial?.sys === undefined) {
    operation = createContentfulOperation(null, updated, childKeys, options) as Operation<"create">
  }
  else {
    operation = createContentfulOperation(initial, updated, childKeys, options)  as Operation<"update">
  }

  if (operation) {
    graph.nodes.push(operation)

    if (parent) {
      createEdge(graph, parent.sys.id, operation.sys.id)
    }
  }
}

const createEdge = (graph: OperationsGraph, a: string, b: string) => {
  if (!Array.isArray(graph.edges[a])) graph.edges[a] = [];

  graph.edges[a].push(b);

  return graph;
}

export const createContentfulOperationsForEntry = (initial: Entry<any>, updated: Entry<any> | null, options: GraphOptions) => {
  const { shouldDelete, locale } = options;
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  }
  const operations = _createContentfulOperationsForEntry(graph, initial, updated, null, {
    locale,
    shouldDelete: shouldDelete ?? false
  });

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "delete") as Operation<"delete">[],
    graph: operations
  }
}

function _createContentfulOperationsForEntry(operations: OperationsGraph, initial: Entry<any>, updated: Entry<any> | null, parent: Entry<any> | null = null, options: GraphOptions) { 
  const childKeys = findReferenceKeys(initial ?? updated)
  const initialReferences = [].concat.apply([], childKeys.map(childKey => initial?.fields[childKey])) as Entry<any>[]
  const updatedReferences = [].concat.apply([], childKeys.map(childKey => updated?.fields[childKey])) as Entry<any>[]

  createNode(operations, initial, updated, parent, options)

  return _createContentfulOperationsForEntries(operations, initialReferences, updatedReferences, parent, options)
}

export const createContentfulOperationsForEntries = (initial: Entry<any>[], updated: Entry<any>[], parent: Entry<any> | null = null, options: GraphOptions) => {
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  } 
  const operations = _createContentfulOperationsForEntries(graph, initial, updated, parent, options);

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "delete") as Operation<"delete">[],
    graph: operations
  }
}

function _createContentfulOperationsForEntries(operations: OperationsGraph, initial: Entry<any>[], updated: Entry<any>[], parent: Entry<any> | null = null, options: GraphOptions) {
  // Queue operations
  for (const updatedEntry of updated) {
    const initialEntry = initial.find(entry => entry.sys?.id === entry?.sys?.id) ?? null

    createNode(operations, initialEntry, updatedEntry, null, options);
  }

  // Find dereferenced entries and queue them to be deleted
  if (options.shouldDelete) {
    const dereferencedEntries = findDereferenced(initial, updated)

    for (const dereferencedEntry of dereferencedEntries) {
      createNode(operations, dereferencedEntry, null, parent, options)
    }
  }

  return operations
}

export function createContentfulOperation(initial: Entry<any> | null, updated: Entry<any> | null, childKeys: string[] = [], options: GraphOptions): Operation | null {
  const { shouldDelete, locale } = options;
  const isFresh = initial === null;
  const isDereference = updated === null;
  const isChanged = initial && hasChanged(initial, updated)

  if (initial && isDereference && shouldDelete) {
    return {
      type: "delete",
      sys: initial.sys
    } as Operation<"delete">
  }
  if (updated && isFresh) {
    const fields = Object.keys(updated.fields).filter(key => childKeys.indexOf(key) === -1).reduce((fields, key) => {
      fields[key] = {
        [locale]: updated.fields[key]
      }
        
      return fields
    }, {} as Record<string, any>);

    return {
      type: "create",
      sys: {
        ...updated.sys,
        id: v4()
      },
      fields: fields
    } as Operation<"create">
  }
  else if (updated && isChanged) {
    const fields = Object.keys(updated.fields).filter(key => childKeys.indexOf(key) === -1).reduce((fields, key) => {
      fields[key] = {
        [locale]: updated.fields[key]
      }
  
      return fields
    }, {} as Record<string, any>);

    return {
      type: "update",
      sys: updated.sys,
      fields: fields
    } as Operation<"update">
  }

  return null
}