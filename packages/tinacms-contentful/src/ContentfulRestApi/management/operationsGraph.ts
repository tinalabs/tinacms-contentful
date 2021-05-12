import { ContentType, ContentTypeLink, Sys } from "contentful";
import { addReferenceId, createContentfulOperation, findReferenceKeys, hasNode } from './utils';

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

/**
 * Creates a node in the graph if a valid operation is found
 * 
 * @param graph The graph to add the node to
 * @param initial The initial state of the node (entry)
 * @param updated The updated state of the node (entry)
 * @param parent If the node (entry) has a parent node (entry)
 * @param options Graph options
 * @returns The updated graph
 */
const createNode = (graph: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options?: GraphOptions) => {
  if (initial === null && updated === null) return;

  const operation = createContentfulOperation(initial, updated, options);
  if (operation !== null) {
    graph.nodes.push(operation)

    //To Do: We need to ensure that parent has an id before we create an edge
    if (parent && parent.sys.id) {
      createEdge(graph, parent?.sys.id, operation?.sys.id)
    }
  }

  return graph;
}

/**
 * Adds an "edge" to the graph, representing a relationship from a parent to a child
 * @param graph The graph to add the edge to 
 * @param from The parent node
 * @param to The child node
 * @returns The updated graph
 */
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
  const operations = computeContentfulOperationsForEntry(
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
function computeContentfulOperationsForEntry(operations: OperationsGraph, initial: Entry<any> | null, updated: Entry<any> | null, parent: Entry<any> | null = null, options?: GraphOptions) {
  const entry = (updated && typeof updated?.sys !== undefined) ? updated : initial;
  const initialKeys = initial !== null ? findReferenceKeys(initial, options?.contentType) : [];
  const initialWithId = initialKeys.map(childKey => addReferenceId(initial, childKey))
  const initialReferences = [].concat.apply([], initialWithId)
    .filter(item => typeof item !== "undefined" && item !== null)
  const updatedKeys = updated !== null ? findReferenceKeys(updated, options?.contentType) : [];
  const updatedWithId = updatedKeys.map(childKey => addReferenceId(updated, childKey))

  const updatedReferences = [].concat.apply([], updatedWithId)
    .filter(item => typeof item !== "undefined" && item !== null)
  if (entry && hasNode(operations, entry) === false) {
    createNode(operations, initial, updated, parent, options);
  }
  if (initialReferences.length > 0 || updatedReferences.length > 0) {
    return computeContentfulOperationsForEntries(operations, initialReferences, updatedReferences, entry, options)
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
  const operations = computeContentfulOperationsForEntries(graph, initial, updated, parent, options);

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
function computeContentfulOperationsForEntries(operations: OperationsGraph, initial: Entry<any>[], updated: Entry<any>[], parent: Entry<any> | null = null, options?: GraphOptions) {
  // Queue operations
  for (const updatedEntry of updated) {
    // If null, we've got a create
    const initialEntry = initial && initial.find(entry => (entry?.sys?.id === updatedEntry?.sys?.id) || false) || null
    
    if (initialEntry || updatedEntry) {
      computeContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  for (const initialEntry of initial) {
    // If null, we've got a dereference
    const updatedEntry = updated && updated.find(entry => (entry?.sys?.id === initialEntry?.sys?.id) || false) || null
    if (initialEntry || updatedEntry) {
      computeContentfulOperationsForEntry(operations, initialEntry, updatedEntry, parent, options);
    }
  }

  return operations
}