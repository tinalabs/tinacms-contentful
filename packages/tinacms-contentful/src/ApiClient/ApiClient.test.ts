import { v4 } from 'uuid'
import { Entry } from "contentful"
import { createReadStream } from "fs"
import { join } from "path"
import { ContentfulClient } from "./ApiClient"

describe("ContentfulClient", () => {
  let locale: string = "en-US"
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
    })

    expect(contentful.sdks.deliveryClient).toBeDefined()
    expect(contentful.sdks.previewClient).toBeDefined()
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
      redirectUrl: "6",
      rateLimit: 1
    })

    expect(() => contentful.sdks.managementClient).toThrowError()
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
    })

    expect(contentful.sdks.deliveryClient).toEqual(mockClient)
    expect(contentful.sdks.previewClient).toEqual(mockClient)
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
    })

    await contentful.sdks.createManagementWithAccessToken("abc123")

    expect(contentful.sdks.managementClient).toBeDefined()
  })

  describe("Entries", () => {
    let contentful: ContentfulClient
    let baseEntry: Entry<any>
    let lessons: Entry<any>[]

    beforeAll(async () => {
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

      await contentful.sdks.createManagementWithAccessToken(process.env.CONTENTFUL_MANAGEMENT_API_TOKEN as string)

      const oldTests = await contentful.getEntries({
        content_type: "course",
        ["fields.title[match]"]: "Test -"
      }, { mode: "preview" })

      await Promise.all(oldTests.map(entry => contentful.deleteEntry(entry.sys.id)))
    })

    beforeEach(async () => {
      baseEntry = {
        sys: { id: v4(), type: 'Entry' },
        fields: {
          title: `Test - ${expect.getState().currentTestName}`,
          slug: `test-${expect.getState().currentTestName.toLowerCase().split(' ').join('-')}`,
          description: expect.getState().currentTestName,
          lessons: []
        },
      } as Entry<any>
  
      lessons = [
        {
          sys: {
            id: v4(),
            type: "Entry",
            contentType: {
              sys: { id: "lesson" }
            }
          },
          fields: {
            title: `Test - ${expect.getState().currentTestName} - Lesson`
          }
        }
      ] as Entry<any>[]
    })

    describe("getEntry", () => {
      const entryId = "1toEOumnkEksWakieoeC6M"

      it("should return an entry when provided a valid entryId", async () => {  
        const res = await contentful.getEntry<any>(entryId)
  
        expect(res.sys.id).toBe(entryId)
        expect(res.fields?.title).toBe("Hello Contentful")
      })
  
      it("should return the latest draft of an entry when provided a valid entryId and options.preview is true", async () => {   
        const res = await contentful.getEntry<any>(entryId, {
          mode: "preview"
        })
  
        expect(res.sys.id).toBe(entryId)
        expect(res.fields?.title).toBe("Hello Contentful - Draft")
      })
  
      it("should return a management entry when provided a valid entryId and options.management is true", async () => {  
        const res = await contentful.getEntry<any>(entryId, {
          mode: "management"
        })

        expect(res.sys.id).toBe(entryId)
        expect(res.sys.version).toBeDefined()
      })
    })

    describe("getEntries", () => {
      const query = {
        content_type: "course",
        limit: 1
      }

      it("should return an array of all published entries when not provided a query", async () => { 
        const res = await contentful.getEntries()
        
        expect(res.length).toBe(37)
      })

      it("should return an array of all draft entries when not provided a query", async () => { 
        const res = await contentful.getEntries(null, {
          mode: "preview"
        })
        
        expect(res.length).toBe(37)
      })

      it("should return an array of all entries when not provided a query", async () => { 
        const res = await contentful.getEntries<unknown>(null, {
          mode: "management"
        })
        
        expect(res.length).toBe(37)
      })
      
      it("should return an array of entries when provided a valid query", async () => { 
        const res = await contentful.getEntries(query)
        
        expect(res.length).toBe(2)
      })

      it("should return an array of the latest draft of entries when provided a valid query and options.preview is true", async () => { 
        const res = await contentful.getEntries(query, { preview: true })
 
        expect(res.length).toBe(2)
      })

      it("should return an array of management entries when provided a valid query", async () => { 
        const res = await contentful.getEntries<any>(query, { mode: "management" })
        const hasInvalidEntry = typeof res.find(item => typeof item.sys.version === "undefined") !== "undefined"
        
        expect(res.length).toBe(2)
        expect(hasInvalidEntry).toBeFalsy()
      })
    })

    describe("createEntry", () => {
      it("createEntry should create an entry when provided a valid content type id and data", async () => {
        var res: any

        try {
          const entry = { ...baseEntry }

          res = await contentful.createEntry("course", entry.fields, { locale })

          expect(res.fields.title).toEqual(entry.fields.title)
          expect(res.fields.slug).toEqual(entry.fields.slug)
          expect(res.sys.id).toBeDefined()
        }
        finally {
          if (res) await contentful.deleteEntry(res.sys.id)
        }
      }, 10000)

      it("should create an entry, including updating simple references", async () => {
        var res: any

        try {
          const entry = {
            ...baseEntry,
            fields: {
              ...baseEntry.fields,
              lessons,
              image: {
                sys: {
                  id: "5o1Zu7UJheEGGQUC6gYEmS",
                  type: 'Asset'
                },
                fields: {}
              }
            }
          }

          res = await contentful.createEntry("course", entry.fields, {
            locale
          })

          expect(res.fields.title).toEqual(entry.fields.title)
          expect(res.fields.slug).toEqual(entry.fields.slug)
          expect(res.sys.id).toBeDefined()
        }
        finally {
          if (res) await contentful.deleteEntry(res.sys.id)
        } 
      }, 10000)

      it("should create an entry with nested references when provided a valid content type id and data", async () => {
        var res: any

        try {
          const entry = {
            ...baseEntry,
            fields: {
              ...baseEntry.fields,
              lessons
            }
          }

          res = await contentful.createEntry("course", entry.fields, {
            locale,
            references: true
          })

          expect(res.fields.title).toEqual(entry.fields.title)
          expect(res.fields.slug).toEqual(entry.fields.slug)
          expect(res.fields.lessons[0].fields.title).toBe(entry.fields.lessons[0].fields.title)
          expect(res.sys.id).toBeDefined()
        }
        catch (error) {
          if (res) await contentful.deleteEntry(res.sys.id)
        }
        finally {
          if (res) await contentful.deleteEntry(res.sys.id)
        }
      }, 30000)
    })

    describe("updateEntry", () => {
      it("should update an entry when provided a valid entryId and new data", async () => {
        var new_entry: any
        var res: any
        
        try {
          const entry = { ...baseEntry }
          const update = {
            ...entry,
            fields: {
              ...entry.fields,
              title: `Updated: ${entry.fields.title}`
            }
          }
  
          new_entry = await contentful.createEntry("course", entry.fields, { locale })
          res = await contentful.updateEntry(new_entry.sys.id, update, { locale })
  
          expect(res.fields.title).toEqual(update.fields.title)
          expect(res.fields.slug).toEqual(entry.fields.slug)
          expect(res.fields.description).toBe(entry.fields.description)
        }
        finally {
          if (res || new_entry) await contentful.deleteEntry(new_entry.sys.id)
        }
      }, 30000)

      it("should update an entry when provided a valid entryId, new data, and references", async () => {
        var new_entry: any
        var res: any
        
        try {
          const entry = {
            ...baseEntry,
            fields: {
              ...baseEntry.fields,
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
            ...entry,
            fields: {
              ...entry.fields,
              title: `Updated: ${entry.fields.title}`
            }
          }
    
          new_entry = await contentful.createEntry("course", entry.fields, { locale, entryId: entry.sys.id })
          res = await contentful.updateEntry(new_entry.sys.id, update, { locale })
          
          expect(res.fields.title).toEqual(update.fields.title)
          expect(res.fields.lessons).toEqual(undefined)
          expect(res.fields.image.sys.id).toBe('5o1Zu7UJheEGGQUC6gYEmS')
        }
        finally {
          if (res || new_entry) await contentful.deleteEntry(new_entry.sys.id)
        }
      }, 30000)

      it("should update references and the related entries when provided a valid entryId, new and initial data, and nested references", async () => {
        var new_entry: any
        var res: any

        try {
          const entry: any = {
            ...baseEntry,
            fields: {
              ...baseEntry.fields,
              image: {
                sys: {
                  id: "5o1Zu7UJheEGGQUC6gYEmS",
                  type: 'Asset'
                },
                fields: {}
              }
            }
          }
          const update: any = {
            ...entry,
            fields: {
              ...entry.fields,
              title: `Updated: Test - ${entry.fields.title}`,
              lessons
            }
          }
    
          new_entry = await contentful.createEntry("course", entry.fields, { locale, entryId: entry.sys.id })
          res = await contentful.updateEntry(new_entry.sys.id, update, {
            locale,
            initial: entry
          })
    
          expect(res.fields.title).toEqual(update.fields.title)
          expect(res.fields.lessons[0].sys.id).toBe(lessons[0].sys.id)
          expect(res.fields.image.sys.id).toBe(update.fields.image.sys.id)
        }
        finally {
          if (res || new_entry) {
            await contentful.deleteEntry(new_entry.sys.id)

            if (res?.fields?.lessons?.[0]) await contentful.deleteEntry(res.fields.lessons[0].sys.id)
          }
        }
      }, 30000)
    })

    it("deleteEntry should delete an entry when provided a valid entryId", async () => {
      var res: any

      try {
        const randomId = Math.floor(Math.random() * 100)
        const entry = {
          fields: {
            title: `Test - ${randomId}`,
            slug: `test-${randomId}`,
            description: expect.getState().currentTestName
          }
        }

        res = await contentful.createEntry("course", entry.fields, { locale })

        expect(() => contentful.deleteEntry(res.sys.id)).toEqual(true);
      }
      catch {
        if (res) await contentful.deleteEntry(res.sys.id)
      }
    }, 20000)
  })

  describe("Assets", () => {
    let contentful: ContentfulClient

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

    it("getAsset should return an asset when provided a valid assetId", async () => {
      const assetId = "5o1Zu7UJheEGGQUC6gYEmS"
      const res = await contentful.getAsset(assetId)
  
      expect(res.sys.id).toBe(assetId)
      expect(res.fields?.title).toBe("Diagram: Content model of \"The example app\"")
    })

    describe("getAssets", () => {
      it("getAssets should return an array of all published assets when provided no query", async () => {
        const res = await contentful.getAssets()
  
        expect(res.length).toBe(1)
      })

      it("getAssets should return an array of published assets when provided a valid query", async () => {
        const query = {
          "fields.file.fileName": "content-model-full.svg"
        }
        const res = await contentful.getAssets(query)
  
        expect(res.length).toBe(1)
      })

      it("getAssets should return an array of all assets when provided no query", async () => {
        const res = await contentful.getAssets(null, { preview: true })
  
        expect(res.length).toBe(9)
      })
    })

    it("createAsset should create an asset when provided a valid file to upload", async () => {
      var res: any

      try {
        const file = createReadStream(join(__dirname, "./_fixtures/tina.png"))
        const asset = {
          fields: {
            title: `Test - ${expect.getState().currentTestName}`,
            description: expect.getState().currentTestName,
            file: {
              file: file,
              contentType: "Untitled",
              fileName: `${expect.getState().currentTestName}.png`
            }
          }
        }
        
        res = await contentful.createAsset(asset, { locale })

        expect(res.fields.title).toBe(asset.fields.title)
      }
      finally {
        if (res) await contentful.deleteAsset(res.sys.id)
      }
    }, 30000)

    it("updateAsset should update an asset when provided a valid assetId and new data", async () => {
      var new_asset: any
      var res: any

      try {
        const file = createReadStream(join(__dirname, "./_fixtures/tina.png"))
        const asset = {
          fields: {
            title: `Test - ${expect.getState().currentTestName}`,
            description: expect.getState().currentTestName,
            file: {
              file: file,
              contentType: "Untitled",
              fileName: `${expect.getState().currentTestName}.png`
            }
          }
        }
        
        new_asset = await contentful.createAsset(asset, { locale })

        const update = {
          ...new_asset,
          fields: {
            ...new_asset.fields,
            title: `Updated: ${asset.fields.title}`
          }
        } as any

        res = await contentful.updateAsset(new_asset.sys.id, update, { locale })

        expect(res.fields.title).toBe(update.fields.title)
      }
      finally {
        if (res || new_asset) await contentful.deleteAsset(new_asset.sys.id)
      }
    }, 30000)
    
    it("deleteAsset should delete an asset when provided a valid assetId", async () => {
      var res: any

      try {
        const file = createReadStream(join(__dirname, "./_fixtures/tina.png"))
        const asset = {
          fields: {
            title: `Test - ${expect.getState().currentTestName}`,
            description: expect.getState().currentTestName,
            file: {
              file: file,
              contentType: "Untitled",
              fileName: `${expect.getState().currentTestName}.png`
            }
          }
        }

        res = await contentful.createAsset(asset, { locale })

        expect(async () => await contentful.deleteAsset(res.sys.id)).toEqual(true)
      }
      catch (error) {
        if (res) await contentful.deleteAsset(res.sys.id)
      }
    }, 30000)
  })
})