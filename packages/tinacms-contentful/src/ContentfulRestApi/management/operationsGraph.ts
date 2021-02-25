import { v4 } from 'uuid';
import { ContentType, ContentTypeLink, Sys } from "contentful";
import { getLocalizedFields } from "./locale";

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
  locale: string;
  shouldDelete?: boolean;
  contentType?: ContentType
}

const isEntry = (entry: Entry<any>) => typeof entry.sys !== "undefined" && entry.sys.type === "Entry"
const isEntries = (entries: Entry<any>[]) => entries.findIndex(entry => isEntry(entry)) > -1
const hasNode = (operations: OperationsGraph, node: Entry<any>) => operations.nodes.findIndex(currentNode => currentNode.sys.id === node.sys.id) > -1

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
      const isReference = fieldDefinition?.type === "Link" || Array.isArray(field) ? isEntries(field) : isEntry(field)

      return isReference
    })
}

const createContentfulOperation = (initial: Entry<any> | null, updated: Entry<any> | null, options: GraphOptions): Operation | null => {
  const { shouldDelete } = options;
  const isDereference = updated === null;
  const isFresh = initial === null;
  const isChanged = initial && hasChanged(initial, updated);

  if (initial && isDereference && shouldDelete) {
    return {
      type: "delete",
      sys: initial.sys
    } as Operation<"delete">
  }
  else if (updated && isFresh) {
    const localizedFields = getLocalizedFields(updated.fields, {
      ...options,
      references: true
    });
  
    return {
      type: "create",
      sys: {
        ...updated.sys,
        id: v4()
      },
      fields: localizedFields
    } as Operation<"create">
  }
  else if (updated && isChanged) {
    const localizedFields = getLocalizedFields(updated.fields, {
      ...options,
      references: true
    });

    return {
      type: "update",
      sys: updated.sys,
      fields: localizedFields
    } as Operation<"update">
  }

  return null
}

const createNode = (graph: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options: GraphOptions) => {
  const { shouldDelete } = options;
  let operation: Operation;

  if (initial === null && updated === null) return;
  
  if (typeof initial === null || typeof initial?.sys === undefined) {
    operation = createContentfulOperation(null, updated, options) as Operation<"create">
  }
  else if (shouldDelete && initial && typeof updated === null || typeof updated?.sys === undefined) {
    operation = createContentfulOperation(null, updated, options) as Operation<"delete">
  }
  else {
    operation = createContentfulOperation(initial, updated, options)  as Operation<"update">
  }

  if (operation) {
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

export const createContentfulOperationsForEntry = (initial: Entry<any>, updated: Entry<any> | null, options: GraphOptions) => {
  const { shouldDelete } = options;
  const graph: OperationsGraph = {
    nodes: [],
    edges: {}
  }
  const operations = _createContentfulOperationsForEntry(graph, initial, updated, null, {
    ...options,
    shouldDelete: shouldDelete ?? false
  });

  return {
    create: operations.nodes.filter(operation => operation.type === "create") as Operation<"create">[],
    update: operations.nodes.filter(operation => operation.type === "update") as Operation<"update">[],
    dereference: operations.nodes.filter(operation => operation.type === "delete") as Operation<"delete">[],
    graph: operations
  }
}

function _createContentfulOperationsForEntry(operations: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options: GraphOptions) {
  const entry = updated ?? initial;
  const childKeys = entry !== null ? findReferenceKeys(entry, options.contentType) : [];
  const initialReferences = [].concat.apply([], childKeys.map(childKey => initial?.fields[childKey]))
    .filter(item => typeof item !== "undefined" && item !== null)
  const updatedReferences = [].concat.apply([], childKeys.map(childKey => updated?.fields[childKey]))
    .filter(item => typeof item !== "undefined" && item !== null)

  if (entry && !hasNode(operations, entry)) {
    createNode(operations, initial, updated, parent, options);
  }

  if (initialReferences.length > 0 || updatedReferences.length > 0) {
    return _createContentfulOperationsForEntries(operations, initialReferences, updatedReferences, entry, options)
  }

  return operations;
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
    // If null, we've got a create
    const initialEntry = initial && initial.find(entry => entry?.sys?.id === (updatedEntry?.sys?.id || false)) || null

    console.log({ initialEntry, updatedEntry })

    if (initialEntry || updatedEntry) {
      _createContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  for (const initialEntry of initial) {
    // If null, we've got a dereference
    const updatedEntry = updated && updated.find(entry => entry?.sys?.id === (initialEntry?.sys?.id || false)) || null

    console.log({ initialEntry, updatedEntry })

    if (initialEntry || updatedEntry) {
      _createContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  return operations
}