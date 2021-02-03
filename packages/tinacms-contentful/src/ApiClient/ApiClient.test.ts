import { Entry } from "contentful-management/dist/typings/entities/entry";
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

  it("should throw an error when accessing the management client before providing an access token or client", () => {
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

    expect(() => contentful.sdks.managementClient).toThrowError();
  })

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
      options: {
        deliveryClient: mockClient,
        previewClient: mockClient,
        managementClient: mockClient
      }
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
    let contentful: ContentfulClient;
    let entryIds: string[] = [];
    let locale: string = "en-US";

    beforeEach(async () => {
      contentful = new ContentfulClient({
        spaceId: process.env.CONTENTFUL_SPACE_ID as string,
        clientId: process.env.CONTENTFUL_OAUTH_CLIENT_ID as string,
        defaultEnvironmentId: "test",
        redirectUrl: "",
        accessTokens: {
          delivery: process.env.CONTENTFUL_DELIVERY_API_TOKEN as string,
          preview: process.env.CONTENTFUL_PREVIEW_API_TOKEN as string
        }
      })

      return await contentful.sdks.createManagementWithAccessToken(process.env.CONTENTFUL_MANAGEMENT_API_TOKEN as string)
    })

    afterEach(async () => {
      return await Promise.allSettled(entryIds.map(async(id, index) =>
        await contentful.deleteEntry(id)
          .finally(() => entryIds.splice(index, 1))
      ))
    });

    describe("getEntry", () => {
      const entryId = "1toEOumnkEksWakieoeC6M";

      it("should return an entry when provided a valid entryId", async () => {  
        const res = await contentful.getEntry<any>(entryId);
  
        expect(res.sys.id).toBe(entryId);
        expect(res.fields?.title).toBe("Hello Contentful");
      })
  
      it("should return the latest draft of an entry when provided a valid entryId and options.preview is true", async () => {   
        const res = await contentful.getEntry<any>(entryId, {
          preview: true
        });
  
        expect(res.sys.id).toBe(entryId);
        expect(res.fields?.title).toBe("Hello Contentful - Draft");
      })
  
      it("should return a management entry when provided a valid entryId and options.management is true", async () => {  
        const res = await contentful.getEntry<any, true>(entryId, {
          management: true
        });

        expect(res.sys.id).toBe(entryId);
        expect(res.sys.version).toBeDefined();
      })
    })

    describe("getEntries", () => {
      const query = {
        content_type: "course"
      }

      it("should return an array of all entries when not provided a query", async () => { 
        const res = await contentful.getEntries()
        
        expect(res.length).toBe(37);
      })
      
      it("should return an array of entries when provided a valid query", async () => { 
        const res = await contentful.getEntries(query)
        
        expect(res.length).toBe(2);
      })

      it("should return an array of the latest draft of entries when provided a valid query and options.preview is true", async () => { 
        const res = await contentful.getEntries(query, { preview: true });
 
        expect(res.length).toBe(3);
      })

      it("should return an array of management entries when provided a valid query", async () => { 
        const res = await contentful.getEntries<any, true>(query, { management: true });
        const hasInvalidEntry = typeof res.find(item => typeof item.sys.version === "undefined") !== "undefined";
        
        expect(res.length).toBe(3);
        expect(hasInvalidEntry).toBeFalsy();
      })
    })

    describe("createEntry", () => {
      it("createEntry should create an entry when provided a valid content type id and data", async () => {
        const randomId = Math.floor(Math.random() * 100);
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            description: expect.getState().currentTestName
          }
        }

        const res = await contentful.createEntry("course", entry.fields, { locale });
        entryIds.push(res.sys.id);

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();
      })

      it("should create an entry, including updating simple references", async () => {
        const randomId = Math.floor(Math.random() * 100);
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            description: expect.getState().currentTestName,
            lessons: [
              {
                sys: { id: `test-lesson-${randomId}`, contentType: { sys: { id: "course" }} },
                fields: {
                  title: `Test - ${randomId} - Lesson`
                }
              }
            ]
          }
        }

        const res = await contentful.createEntry("course", entry.fields, {
          locale
        });
        entryIds.push(res.sys.id);

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();
      })

      it("should create an entry with nested references when provided a valid content type id and data", async () => {
        const randomId = Math.floor(Math.random() * 100);
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            description: expect.getState().currentTestName,
            lessons: [
              {
                sys: { id: `test-lesson-${randomId}`, contentType: { sys: { id: "course" }} },
                fields: {
                  title: `Test - ${randomId} - Lesson`
                }
              }
            ]
          }
        }

        const res = await contentful.createEntry("course", entry.fields, {
          locale,
          references: true
        })
        entryIds.push(res.sys.id)

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();
      })
    })

    it("updateEntry should update an entry when provided a valid entryId and new data", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const entry = {
        fields: {
          title: `Test - ${randomId}`,
          slug: `test-${randomId}`,
          description: expect.getState().currentTestName
        }
      }
      const update = {
        title:`Updated: Test - ${randomId}`
      }

      const new_entry = await contentful.createEntry("course", entry.fields, { locale });
      const res = await contentful.updateEntry(new_entry.sys.id, update, { locale });
      entryIds.push(res.sys.id);

      expect(res.fields.title[locale]).toEqual(update.title);
    }, 10000);

    it("deleteEntry should delete an entry when provided a valid entryId", async () => {
      const randomId = Math.floor(Math.random() * 100);
      const entry = {
        fields: {
          title: `Test - ${randomId}`,
          slug: `test-${randomId}`,
          description: expect.getState().currentTestName
        }
      }

      const new_entry = await contentful.createEntry("course", entry.fields, { locale });

      expect(await contentful.deleteEntry(new_entry.sys.id)).toBeUndefined();
    }, 10000);
  })

  describe("Assets", () => {
    let contentful: ContentfulClient;
    let assetIds: string[] = [];

    beforeEach(async () => {
      contentful = new ContentfulClient({
        spaceId: process.env.CONTENTFUL_SPACE_ID as string,
        clientId: process.env.CONTENTFUL_OAUTH_CLIENT_ID as string,
        defaultEnvironmentId: "test",
        redirectUrl: "/",
        accessTokens: {
          delivery: process.env.CONTENTFUL_DELIVERY_API_TOKEN as string,
          preview: process.env.CONTENTFUL_PREVIEW_API_TOKEN as string
        }
      })

      return await contentful.sdks.createManagementWithAccessToken(process.env.CONTENTFUL_MANAGEMENT_API_TOKEN as string)
    })

    afterEach(async () => {
      return await Promise.allSettled(assetIds.map(async(id, index) =>
        await contentful.deleteAsset(id)
          .finally(() => assetIds.splice(index, 1))
      ))
    });

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
            ['en-US']: expect.getState().currentTestName
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
      const res = await contentful.createAsset(asset);

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
            ['en-US']: expect.getState().currentTestName
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

      const new_asset = await contentful.createAsset(asset);

      expect(await contentful.deleteAsset(new_asset.sys.id)).toBeUndefined();
    }, 20000)
  })
});