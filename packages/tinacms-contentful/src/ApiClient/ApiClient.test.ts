import { readFileSync } from "fs";
import { join } from "path";
import { ContentfulClient } from ".";

describe("ContentfulClient", () => {
  let mockClient: any = {
    foo: "bar"
  }

  it("should create the delivery SDK clients when provided with valid options", () => {
    const contentful = new ContentfulClient({
      clientId: "0",
      spaceId: "1",
      accessTokens: {
        delivery: "2",
        preview: "3"
      },
      defaultEnvironmentId: "5",
      redirectUrl: "6"
    });

    expect(contentful.sdks.deliveryClient).toBeDefined();
    expect(contentful.sdks.previewClient).toBeDefined();
  })

  it.skip("should throw an error when accessing the management client before providing an access token", () => {})

  it("should use SDK clients when provided with custom implementations", () => {
    const contentful = new ContentfulClient({
      clientId: "0",
      spaceId: "1",
      accessTokens: {
        delivery: "2",
        preview: "3"
      },
      defaultEnvironmentId: "5",
      redirectUrl: "6",
      deliveryClient: mockClient,
      previewClient: mockClient,
      managementClient: mockClient
    });

    expect(contentful.sdks.deliveryClient).toEqual(mockClient);
    expect(contentful.sdks.previewClient).toEqual(mockClient);
    expect(contentful.sdks.managementClient).toEqual(mockClient);
  })

  it("should have a management client when it is set up with a token", async () => {
    const contentful = new ContentfulClient({
      clientId: "0",
      spaceId: "1",
      accessTokens: {
        delivery: "2",
        preview: "3"
      },
      defaultEnvironmentId: "5",
      redirectUrl: "6"
    });

    await contentful.sdks.createManagementWithAccessToken("abc123");

    expect(contentful.sdks.managementClient).toBeDefined();
  });

  describe("Entries", () => {
    let client: ContentfulClient;
    let entryIds: string[] = [];

    beforeEach(async () => {
      client = new ContentfulClient({
        spaceId: process.env.CONTENTFUL_SPACE_ID as string,
        clientId: process.env.CONTENTFUL_OAUTH_CLIENT_ID as string,
        defaultEnvironmentId: "test",
        redirectUrl: "/authorize",
        accessTokens: {
          delivery: process.env.CONTENTFUL_DELIVERY_API_TOKEN as string,
          preview: process.env.CONTENTFUL_PREVIEW_API_TOKEN as string
        }
      })

      await client.sdks.createManagementWithAccessToken(process.env.CONTENTFUL_MANAGEMENT_API_TOKEN as string)
    })

    it.skip("getEntry should return an entry when provided a valid entryId", async () => {
      const entryId = "2uNOpLMJioKeoMq8W44uYc";

      const res = await client.getEntry(entryId);

      expect(res.sys.id).toBe(entryId);
    })

    it.skip("getEntry should return the latest draft of an entry when provided a valid entryId and options.preview is true", async () => { })

    it.skip("getEntries should return an array of ebtries when provided a valid query", async () => { })

    it("createEntry should create an entry when provided a valid content type id and data", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const entry = {
        fields: {
          title: {
            ["en-US"]: `Test - ${randomId}`
          },
          slug: {
            ['en-US']: `test-${randomId}`
          }
        }
      }

      const res = await client.createEntry("course", entry);

      expect(res.fields.title).toEqual(entry.fields.title);
      expect(res.fields.slug).toEqual(entry.fields.slug);
      expect(res.sys.id).toBeDefined();

      entryIds.push(res.sys.id);
    })

    it("updateEntry should update an entry when provided a valid entryId and new data", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const entry = {
        fields: {
          title: {
            ["en-US"]: `Test - ${randomId}`
          },
          slug: {
            ['en-US']: `test-${randomId}`
          }
        }
      }
      const update = {
        title: {
          ["en-US"]: `Updated: Test - ${randomId}`
        }
      }

      const new_entry = await client.createEntry("course", entry);
      const res = await client.updateEntry(new_entry.sys.id, update);

      entryIds.push(res.sys.id);

      expect(res.fields.title).toEqual(update.title);
    });

    it("deleteEntry should delete an entry when provided a valid entryId", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const entry = {
        fields: {
          title: {
            ["en-US"]: `Test - ${randomId}`
          },
          slug: {
            ['en-US']: `test-${randomId}`
          }
        }
      }

      const new_entry = await client.createEntry("course", entry);

      expect(await client.deleteEntry(new_entry.sys.id)).toBeUndefined();
    }, 10000);

    afterAll(async () => {
      for (let entryId of entryIds) {
        await client.deleteEntry(entryId);
      }
    });
  })

  describe("Assets", () => {
    let client: ContentfulClient;
    let assetIds: string[] = [];

    beforeEach(async () => {
      client = new ContentfulClient({
        spaceId: process.env.CONTENTFUL_SPACE_ID as string,
        clientId: process.env.CONTENTFUL_OAUTH_CLIENT_ID as string,
        defaultEnvironmentId: "test",
        redirectUrl: "/authorize",
        accessTokens: {
          delivery: process.env.CONTENTFUL_DELIVERY_API_TOKEN as string,
          preview: process.env.CONTENTFUL_PREVIEW_API_TOKEN as string
        }
      })

      await client.sdks.createManagementWithAccessToken(process.env.CONTENTFUL_MANAGEMENT_API_TOKEN as string)
    })

    it.skip("getAsset should return an asset when provided a valid assetId", async () => { })
    it.skip("getAssets should return an array of assets when provided a valid query", async () => { })

    it("createAsset should create an asset when provided a valid file to upload", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const file = readFileSync(join(__dirname, "./_fixtures/tina.png"));
      const asset = {
        fields: {
          title: {
            ['en-US']: `Test - ${randomId}`
          },
          description: {
            ['en-US']: `Test description - ${randomId}`
          },
          file: {
            ['en-US']: {
              file: file,
              contentType: "Untitled",
              fileName: `${randomId}.png`
            }
          }
        }
      }
      const res = await client.createAsset(asset);

      expect(res.fields.title['en-US']).toBe(asset.fields.title["en-US"]);

      assetIds.push(res.sys.id);
    }, 20000);

    it.skip("updateAsset should update an asset when provided a valid assetId and new data", async () => { })
    
    it("deleteAsset should delete an asset when provided a valid assetId", async () => { 
      const randomId = Math.floor(Math.random() * 100);
      const file = readFileSync(join(__dirname, "./_fixtures/tina.png"));
      const asset = {
        fields: {
          title: {
            ['en-US']: `Test - ${randomId}`
          },
          description: {
            ['en-US']: `Test description - ${randomId}`
          },
          file: {
            ['en-US']: {
              file: file,
              contentType: "Untitled",
              fileName: `${randomId}.png`
            }
          }
        }
      }

      const new_asset = await client.createAsset(asset);

      expect(await client.deleteAsset(new_asset.sys.id)).toBeUndefined();
    }, 20000)

    afterAll(async () => {
      for (let assetId of assetIds) {
        await client.deleteAsset(assetId);
      }
    });
  })
});