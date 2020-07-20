import {mock} from "jest-mock-extended";
import * as contentfulDelivery from 'contentful';
import * as contentfulManagement from 'contentful-management';
import { ContentfulAuthenticationService } from '../services/contentful/authentication';
import { ContentfulClient } from './contentful';

const mockContentfulDelivery = mock<typeof contentfulDelivery>();
const mockContentfulManagement = mock<typeof contentfulManagement>();

jest.mock("contentful", () => mockContentfulDelivery);
jest.mock("contentful-management", mockContentfulManagement);

describe("UNIT UNDER TEST", async() => {
  it("EXPECTED RESULT, STATE UNDER TEST", async() => {
    // arrange

    // act

    // assert
  });
});

describe("Contentful Api Client", async () => {
  it("should have a delivery and management sdk instance when provided a client key, spaceId, delivery access token, and management access token", async () => {
    // arrange
    const clientId = "";
    const spaceId = "";
    const deliveryAccessToken = "";
    const managementAccessToken = "";
    let contentfulClient: ContentfulClient;

    // act
    mockCreateDeliveryClient
    contentfulClient = new ContentfulClient({
      clientId: clientId,
      spaceId: spaceId,
      accessTokens: {
        delivery: deliveryAccessToken,
        management: managementAccessToken
      }
    })
    
    // assert

  })
});