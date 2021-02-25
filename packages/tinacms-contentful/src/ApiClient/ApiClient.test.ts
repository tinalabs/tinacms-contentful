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
        previewClient: mockClient
      }
    });

    expect(contentful.sdks.deliveryClient).toEqual(mockClient);
    expect(contentful.sdks.previewClient).toEqual(mockClient);
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
      return await Promise.all(entryIds.map(async(id, index) =>
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
          mode: "preview"
        });
  
        expect(res.sys.id).toBe(entryId);
        expect(res.fields?.title).toBe("Hello Contentful - Draft");
      })
  
      it("should return a management entry when provided a valid entryId and options.management is true", async () => {  
        const res = await contentful.getEntry<any>(entryId, {
          mode: "management"
        });

        expect(res.sys.id).toBe(entryId);
        expect(res.sys.version).toBeDefined();
      })
    })

    describe("getEntries", () => {
      const query = {
        content_type: "course",
        limit: 1
      }

      it("should return an array of all published entries when not provided a query", async () => { 
        const res = await contentful.getEntries()
        
        expect(res.length).toBe(37);
      })

      it("should return an array of all draft entries when not provided a query", async () => { 
        const res = await contentful.getEntries(null, {
          mode: "preview"
        })
        
        expect(res.length).toBe(37);
      })

      it("should return an array of all entries when not provided a query", async () => { 
        const res = await contentful.getEntries<unknown>(null, {
          mode: "management"
        })
        
        expect(res.length).toBe(37);
      })
      
      it("should return an array of entries when provided a valid query", async () => { 
        const res = await contentful.getEntries(query)
        
        expect(res.length).toBe(2);
      })

      it("should return an array of the latest draft of entries when provided a valid query and options.preview is true", async () => { 
        const res = await contentful.getEntries(query, { preview: true });
 
        expect(res.length).toBe(2);
      })

      it("should return an array of management entries when provided a valid query", async () => { 
        const res = await contentful.getEntries<any>(query, { mode: "management" });
        const hasInvalidEntry = typeof res.find(item => typeof item.sys.version === "undefined") !== "undefined";
        
        expect(res.length).toBe(2);
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

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();

        // We do this at the end to avoid premature cleanup
        entryIds.push(res.sys.id);
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
            ],
            image: {
              sys: {
                id: "5o1Zu7UJheEGGQUC6gYEmS",
                type: 'Asset'
              },
              fields: {}
            }
          }
        }

        const res = await contentful.createEntry("course", entry.fields, {
          locale
        });

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();

        // We do this at the end to avoid premature cleanup
        entryIds.push(res.sys.id);
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

        expect(res.fields.title[locale]).toEqual(entry.fields.title);
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.sys.id).toBeDefined();

        // We do this at the end to avoid premature cleanup
        entryIds.push(res.sys.id);
      })
    })

    describe("updateEntry", () => {
      it("should update an entry when provided a valid entryId and new data", async () => {
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
        expect(res.fields.slug[locale]).toEqual(entry.fields.slug);
        expect(res.fields.description[locale]).toBe(entry.fields.description);
      }, 10000);

      it("should update an entry when provided a valid entryId, new data, and references", async () => {
        const randomId = Math.floor(Math.random() * 100);
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            lessons: [
              {
                sys: { id: '3KinTi83FecuMeiUo0qGU4', contentType: { sys: { id: "lesson" }} },
                fields: {
                  title: `Test - ${randomId} - Lesson`
                }
              }
            ],
            image: {
              sys: {
                id: "5o1Zu7UJheEGGQUC6gYEmS",
                type: 'Asset'
              },
              fields: {}
            }
          }
        }
        const update = {
          title:`Updated: Test - ${randomId}`
        }
  
        const new_entry = await contentful.createEntry("course", entry.fields, { locale });
        const res = await contentful.updateEntry(new_entry.sys.id, update, { locale });
  
        expect(res.fields.title[locale]).toEqual(update.title);
        expect(res.fields.lesons[locale][0].sys.id).toBe('3KinTi83FecuMeiUo0qGU4')
        expect(res.fields.image[locale].sys.id).toBe('5o1Zu7UJheEGGQUC6gYEmS')

        // We do this at the end to avoid premature cleanup
        entryIds.push(res.sys.id);
      }, 10000);

      it("should update all referenced entries when provided a valid entryId, new and initial data, and nested references", async () => {
        const randomId = Math.floor(Math.random() * 100);
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            lessons: [],
            image: {
              sys: {
                id: "5o1Zu7UJheEGGQUC6gYEmS",
                type: 'Asset'
              },
              fields: {}
            }
          }
        }
        const update = {
          title: `Updated: Test - ${randomId}`,
          lessons: [
            {
              sys: { id: '3KinTi83FecuMeiUo0qGU4', contentType: { sys: { id: "lesson" }} },
              fields: {
                title: `Test - ${randomId} - Lesson`
              }
            }
          ],
        }
  
        const new_entry = await contentful.createEntry("course", entry.fields, { locale });
        const res = await contentful.updateEntry(new_entry.sys.id, update, {
          locale, initial: {
            ...entry,
            sys: new_entry.sys as any
          }});
  
        expect(res.fields.title[locale]).toEqual(update.title);
        expect(res.fields.lesons[locale][0].sys.id).toBe('3KinTi83FecuMeiUo0qGU4')
        expect(res.fields.image[locale].sys.id).toBe('5o1Zu7UJheEGGQUC6gYEmS')

        // We do this at the end to avoid premature cleanup
        entryIds.push(res.sys.id);
      }, 10000);
    })

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

      expect(() => contentful.deleteEntry(new_entry.sys.id)).not.toThrow();
    }, 20000);
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
      return await Promise.all(assetIds.map(async(id, index) =>
        await contentful.deleteAsset(id)
          .finally(() => assetIds.splice(index, 1))
      ))
    });

    it("getAsset should return an asset when provided a valid assetId", async () => {
      const assetId = "5o1Zu7UJheEGGQUC6gYEmS";
      const res = await contentful.getAsset(assetId);
  
      expect(res.sys.id).toBe(assetId);
      expect(res.fields?.title).toBe("Diagram: Content model of \"The example app\"");
    })

    describe("getAssets", () => {
      it("getAssets should return an array of all published assets when provided no query", async () => {
        const res = await contentful.getAssets();
  
        expect(res.length).toBe(2);
      })

      it("getAssets should return an array of published assets when provided a valid query", async () => {
        const query = {
          "fields.file.contentType": "image/png"
        }
        const res = await contentful.getAssets(query);
  
        expect(res.length).toBe(1);
      })

      it("getAssets should return an array of all assets when provided no query", async () => {
        const res = await contentful.getAssets(null, { preview: true});
  
        expect(res.length).toBe(10);
      })
    })

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

      // We do this at the end to avoid premature cleanup
      assetIds.push(res.sys.id);
    }, 30000);

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
    }, 30000)
  })
});