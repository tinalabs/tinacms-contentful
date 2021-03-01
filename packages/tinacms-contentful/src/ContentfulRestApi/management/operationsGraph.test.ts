import { Entry } from 'contentful';
import {
  createContentfulOperationsForEntry,
  createContentfulOperationsForEntries,
} from './operationsGraph';

describe('operationsGraph', () => {
  let baseEntry: Entry<any>;
  let references: Entry<any>[];

  beforeEach(() => {
    baseEntry = {
      sys: { id: '0', type: 'Entry' },
      fields: {
        test: 'initial',
      },
    } as Entry<any>;

    references = [
      {
        sys: { id: '1', type: 'Entry' },
        fields: {
          test: 'initial',
        },
      },
    ] as Entry<any>[];
  });

  describe('createContentfulOperationForEntry', () => {
    it('should create an update operation for a flat entry with updated fields', () => {
      const entry_initial = Object.assign({}, baseEntry);
      const entry_updated = ({
        ...baseEntry,
        fields: {
          ...baseEntry.fields,
          test: 'updated',
        },
      } as unknown) as Entry<any>;

      const { graph } = createContentfulOperationsForEntry(
        entry_initial,
        entry_updated
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {},
          "nodes": Array [
            Object {
              "fields": Object {
                "test": "updated",
              },
              "sys": Object {
                "id": "0",
                "type": "Entry",
              },
              "type": "update",
            },
          ],
        }
      `);
      expect(graph.nodes.length).toBe(1);
      expect(Object.keys(graph.edges).length).toBe(0);
    });

    it('should not create an update operation for a simple entry whose fields have not changed', () => {
      const entry_initial = Object.assign({}, baseEntry);
      const entry_updated = baseEntry;

      const { graph } = createContentfulOperationsForEntry(
        entry_initial,
        entry_updated
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {},
          "nodes": Array [],
        }
      `);
      expect(graph.nodes.length).toBe(0);
      expect(Object.keys(graph.edges).length).toBe(0);
    });

    it('should create create operations for any entry who has new entity references, and update the entry', () => {
      const entry_initial = Object.assign({}, baseEntry);
      const entry_updated = {
        ...entry_initial,
        fields: {
          ...entry_initial.fields,
          references,
        },
      } as Entry<any>;

      const { graph } = createContentfulOperationsForEntry(
        entry_initial,
        entry_updated
      );

      expect(graph).toStrictEqual({
        edges: {
          '0': [graph.nodes[1].sys.id],
        },
        nodes: [
          {
            fields: {
              references: [
                {
                  sys: {
                    id: '1',
                    linkType: 'Entry',
                    type: 'Link',
                  },
                },
              ],
              test: 'initial',
            },
            sys: {
              id: '0',
              type: 'Entry',
            },
            type: 'update',
          },
          {
            fields: {
              test: 'initial',
            },
            sys: {
              id: graph.nodes[1].sys.id,
              type: 'Entry',
            },
            type: 'create',
          },
        ],
      });
      expect(graph.nodes.length).toBe(2);
      expect(graph.nodes[0].type).toBe('update');
      expect(graph.nodes[1].type).toBe('create');
      expect(Object.keys(graph.edges).length).toBe(1);
    });

    it('should create update operations for any references that have changed, and update the entry', () => {
      const entry = Object.assign({}, baseEntry);
      const entry_initial = {
        ...entry,
        fields: {
          ...baseEntry.fields,
          references,
        },
      };
      const entry_updated = {
        ...entry_initial,
        fields: {
          ...entry_initial.fields,
          test: 'updated',
          references: Array.of(...references).map((reference) => ({
            ...reference,
            fields: {
              ...reference.fields,
              test: 'updated',
            },
          })),
        },
      } as Entry<any>;

      const { graph } = createContentfulOperationsForEntry(
        entry_initial,
        entry_updated
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {
            "0": Array [
              "1",
            ],
          },
          "nodes": Array [
            Object {
              "fields": Object {
                "references": Array [
                  Object {
                    "sys": Object {
                      "id": "1",
                      "linkType": "Entry",
                      "type": "Link",
                    },
                  },
                ],
                "test": "updated",
              },
              "sys": Object {
                "id": "0",
                "type": "Entry",
              },
              "type": "update",
            },
            Object {
              "fields": Object {
                "test": "updated",
              },
              "sys": Object {
                "id": "1",
                "type": "Entry",
              },
              "type": "update",
            },
          ],
        }
      `);
      expect(graph.nodes.length).toBe(2);
      expect(graph.nodes[0].type).toBe('update');
      expect(graph.nodes[1].type).toBe('update');
      expect(Object.keys(graph.edges).length).toBe(1);
    });

    it('should create a delete operation for any removed references, and update the entry', () => {
      const entry = Object.assign({}, baseEntry);
      const entry_initial = {
        ...entry,
        fields: {
          ...entry.fields,
          references,
        },
      };
      const entry_updated = {
        ...entry_initial,
        fields: {
          test: 'updated',
          references: [],
        },
      } as Entry<any>;

      const { graph } = createContentfulOperationsForEntry(
        entry_initial,
        entry_updated
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {
            "0": Array [
              "1",
            ],
          },
          "nodes": Array [
            Object {
              "fields": Object {
                "references": Array [],
                "test": "updated",
              },
              "sys": Object {
                "id": "0",
                "type": "Entry",
              },
              "type": "update",
            },
            Object {
              "sys": Object {
                "id": "1",
                "type": "Entry",
              },
              "type": "dereference",
            },
          ],
        }
      `);
      expect(graph.nodes.length).toBe(2);
      expect(Object.keys(graph.edges).length).toBe(1);
    });
  });

  describe('createContentfulOperationsForEntries', () => {
    let entries: Entry<any>[];

    beforeEach(() => {
      entries = [baseEntry];
    });

    it('should create update operations for entries whose fields have changed', () => {
      const entries_initial = entries;
      const entries_updated = entries_initial.map((entry) => ({
        ...entry,
        fields: {
          ...entry.fields,
          test: 'updated',
        },
      }));

      const { graph } = createContentfulOperationsForEntries(
        entries_initial,
        entries_updated,
        null
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {},
          "nodes": Array [
            Object {
              "fields": Object {
                "test": "updated",
              },
              "sys": Object {
                "id": "0",
                "type": "Entry",
              },
              "type": "update",
            },
          ],
        }
      `);
      expect(graph.nodes.length).toBe(1);
      expect(Object.keys(graph.edges).length).toBe(0);
      expect(graph.nodes[0].type).toEqual('update');
    });

    it('should not create update operations for entries whose fields have not changed', () => {
      const entries_initial = entries;
      const entries_updated = entries_initial;

      const { graph } = createContentfulOperationsForEntries(
        entries_initial,
        entries_updated,
        null
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {},
          "nodes": Array [],
        }
      `);
      expect(graph.nodes.length).toBe(0);
      expect(Object.keys(graph.edges).length).toBe(0);
    });

    it('should create create operations for entries lacking a sys.id', () => {
      const entries_initial: Entry<any>[] = [];
      const entries_updated = entries.map((entry) => {
        const { sys } = entry;

        sys.id === undefined;

        return {
          ...entry,
          sys,
        };
      });
      const { graph } = createContentfulOperationsForEntries(
        entries_initial,
        entries_updated,
        null
      );

      expect(graph).toEqual({
        edges: {},
        nodes: [
          {
            fields: {
              test: 'initial',
            },
            sys: {
              id: graph.nodes[0].sys.id,
              type: 'Entry',
            },
            type: 'create',
          },
        ],
      });
      expect(graph.nodes.length).toBe(1);
      expect(Object.keys(graph.edges).length).toBe(0);
      expect(graph.nodes[0].type).toEqual('create');
      expect(graph.nodes[0].sys.id).toBeDefined();
    });

    it('should create a delete operation for an entry not present in updated', () => {
      const entries_initial = entries;
      const entries_updated: Entry<any>[] = [];

      const { graph } = createContentfulOperationsForEntries(
        entries_initial,
        entries_updated,
        null
      );

      expect(graph).toMatchInlineSnapshot(`
        Object {
          "edges": Object {},
          "nodes": Array [
            Object {
              "sys": Object {
                "id": "0",
                "type": "Entry",
              },
              "type": "dereference",
            },
          ],
        }
      `);
      expect(graph.nodes.length).toBe(1);
      expect(Object.keys(graph.edges).length).toBe(0);
      expect(graph.nodes[0].type).toEqual("dereference");
    });
  });
});
