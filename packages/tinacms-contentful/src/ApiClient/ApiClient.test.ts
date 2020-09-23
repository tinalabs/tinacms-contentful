import { ContentfulClient } from ".";

describe("ContentfulClient", () => {
  let mockClient: any = {
    foo: "bar"
  }

  it("should create the SDK clients when provided with valid options", () => {
    const contentful = new ContentfulClient({
      clientId: "0",
      spaceId: "1",
      accessTokens: {
        delivery: "2",
        preview: "3",
        management: "4"
      },
      defaultEnvironmentId: "5",
      redirectUrl: "6"
    });

    expect(contentful.sdks.deliveryClient).toBeDefined();
    expect(contentful.sdks.previewClient).toBeDefined();
    expect(contentful.sdks.managementClient).toBeDefined();
  })

  it("should use SDK clients when provided with custom implementations", () => {
    const contentful = new ContentfulClient({
      clientId: "0",
      spaceId: "1",
      accessTokens: {
        delivery: "2",
        preview: "3",
        management: "4"
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
});