import { Entry } from "contentful";
import uuidBase62 from "uuid-base62";

export interface OperationsGraph {
  nodes: Operation[];
  edges: {
    [entryId: string]: string[];
  };
}

export type OperationType = "create" | "update" | "delete";

export type Operation<Type = OperationType> = Type extends "create"
  ? {
      type: Type;
      fields: Record<string, any>;
      sys: { id: string };
    }
  : Type extends "delete" ?
    {
      type: Type,
      fields?: undefined,
      sys: { id: string }
    }
  : {
      type: Type;
      fields: Record<string, any>;
      sys: Record<string, any>;
  };

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

const createNode = (graph: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent?: Entry<any> | null, shouldDelete: boolean = false) => {  
  let operation: Operation;
  const childKeys = updated && findReferenceKeys(updated) || [];

  if (initial === null && updated === null) return;
  
  if (typeof initial === null || typeof initial?.sys === undefined) {
    operation = createContentfulOperation(null, updated, childKeys, false) as Operation<"create">
  }
  else {
    operation = createContentfulOperation(initial, updated, childKeys, shouldDelete)  as Operation<"update">
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

export const createContentfulOperationsForEntry = (initial: Entry<any>, updated: Entry<any> | null, shouldDelete: boolean = false) => {
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  }
  const operations = _createContentfulOperationsForEntry(graph, initial, updated, null, shouldDelete);

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "delete") as Operation<"delete">[],
    graph: operations
  }
}

function _createContentfulOperationsForEntry(operations: OperationsGraph, initial: Entry<any>, updated: Entry<any> | null, parent?: Entry<any> | null, shouldDelete: boolean = false) { 
  const childKeys = findReferenceKeys(initial ?? updated)
  const initialReferences = [].concat.apply([], childKeys.map(childKey => initial?.fields[childKey])) as Entry<any>[]
  const updatedReferences = [].concat.apply([], childKeys.map(childKey => updated?.fields[childKey])) as Entry<any>[]

  createNode(operations, initial, updated, parent)

  return _createContentfulOperationsForEntries(operations, initialReferences, updatedReferences, parent ?? null, shouldDelete)
}

export const createContentfulOperationsForEntries = (initial: Entry<any>[], updated: Entry<any>[], parent?: Entry<any> | null, shouldDelete: boolean = false) => {
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  } 
  const operations = _createContentfulOperationsForEntries(graph, initial, updated, parent, shouldDelete);

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "delete") as Operation<"delete">[],
    graph: operations
  }
}

function _createContentfulOperationsForEntries(operations: OperationsGraph, initial: Entry<any>[], updated: Entry<any>[], parent?: Entry<any> | null, shouldDelete: boolean = false) {
  // Queue operations
  for (const updatedEntry of updated) {
    const initialEntry = initial.find(entry => entry.sys?.id === entry?.sys?.id) ?? null

    createNode(operations, initialEntry, updatedEntry, null, shouldDelete);
  }

  // Find dereferenced entries and queue them to be deleted
  if (shouldDelete) {
    const dereferencedEntries = findDereferenced(initial, updated)

    for (const dereferencedEntry of dereferencedEntries) {
      createNode(operations, dereferencedEntry, null, parent, shouldDelete)
    }
  }

  return operations
}

export function createContentfulOperation(initial: Entry<any> | null, updated: Entry<any> | null, childKeys: string[] = [], shouldDelete?: boolean): Operation | null {
  const locale = "en-CA";
  const isFresh = initial === null;
  const isDereference = updated === null;
  const isChanged = initial && hasChanged(initial, updated)

  if (initial && isDereference && shouldDelete) {
    return {
      type: "delete",
      sys: initial.sys
    } 
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
        id: uuidBase62.v4()
      },
      fields: fields
    }
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
    }
  }

  return null
}