import { Entry } from "contentful";
import { createContentfulOperationsForEntry, createContentfulOperationsForEntries, Operation, OperationsGraph } from "./operationsGraph";

describe("operationsGraph", () => {
  const locale = "en-CA";

  describe("createContentfulOperationForEntry", () => {
    it("should create an update operation for a simple entry with different fields", () => {
      const entry_initial = {
        sys: {},
        fields: {
          test: "initial"
        }
      } as unknown as Entry<any>;
      const entry_updated = {
        sys: {},
        fields: {
          test: "updated"
        }
      } as unknown as Entry<any>;

      const {graph} = createContentfulOperationsForEntry(entry_initial, entry_updated);
      const expected: OperationsGraph = {
        nodes: [{ type: "update", fields: { test: { [locale]: "updated" } }, sys: {} }],
        edges: {}
      }

      expect(graph).toEqual(expected);
    })

    it("should not create an update operation for a simple entry whose fields have not changed", () => {
      const entry = {
        sys: {},
        fields: {}
      } as unknown as Entry<any>;

      const {graph} = createContentfulOperationsForEntry(entry, entry);
      const expected: OperationsGraph = {
        nodes: [],
        edges: {}
      }

      expect(graph).toEqual(expected);
    })
  })

  describe("createContentfulOperationsForEntries", () => {
    it("should not create an operation for a simple entry whose fields have not changed", () => {
      const entry_initial = {
        sys: {},
        fields: {
          test: "initial"
        }
      } as unknown as Entry<any>;
      const entry_updated = {
        sys: {},
        fields: {
          test: "updated"
        }
      } as unknown as Entry<any>;

    const {graph} = createContentfulOperationsForEntry(entry_initial, entry_updated);
      const expected: OperationsGraph = {
        nodes: [{ type: "update", fields: { test: { [locale]: "updated" } }, sys: {} }],
        edges: {}
      }

      expect(graph).toEqual(expected);
    })

    it("should create a create operation for a simple entry lacking a sys.id", () => {
      const entry = {
        sys: {},
        fields: {}
      } as unknown as Entry<any>;
  
      const {graph} = createContentfulOperationsForEntries([], [entry], null);
  
      expect(graph.nodes.length).toBe(1);
      expect(graph.nodes[0].type).toEqual("create");
      expect(graph.nodes[0].sys.id).toBeDefined()
    })
    
    it("should create a delete operation for an entry not present in updated", () => {
      const entry = {
        sys: {
          id: "1"
        },
        fields: {}
      } as unknown as Entry<any>;
  
      const {graph} = createContentfulOperationsForEntries([entry], [], null, true);
  
      expect(graph.nodes.length).toBe(1);
      expect(graph.nodes[0].type).toEqual("delete");
    })
  })
})