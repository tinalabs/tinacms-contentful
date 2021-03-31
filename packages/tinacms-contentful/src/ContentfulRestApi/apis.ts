import {
  createClient as createDeliveryClient,
  ContentfulClientApi,
} from 'contentful';
import { ClientAPI, createClient as createManagementClient } from 'contentful-management';
import { SpaceOptions } from '../ApiClient';

export interface ContentfulApiServiceOptions extends SpaceOptions {
  environmentId?: string;
}

/**
 * Manages creating Contentful Clients for the API Client
 */
export class ContentfulApiService {
  /**
   * @param options A standard set of options for Contentful's Delivery/Preview API and Management API
   */
  constructor(public options: ContentfulApiServiceOptions) {}

  public static DELIVERY_CLIENT_ERROR =
    '`accessTokens.delivery` or `deliveryClient` was not provided in options';
  public static PREVIEW_CLIENT_ERROR =
    '`accessTokens.preview` or `previewClient` was not provided in options';
  public static MANAGEMENT_CLIENT_ERROR =
    '`managementClient` was undefined';

  private m_DeliveryClient!: ContentfulClientApi;
  private m_PreviewClient!: ContentfulClientApi;
  private m_ManagementClient!: ClientAPI;

  get deliveryClient(): ContentfulClientApi {
    if (!this.m_DeliveryClient && this.options?.options?.deliveryClient) {
      this.m_DeliveryClient = this.options.options?.deliveryClient;
    }
    else if (!this.m_DeliveryClient && this.options?.accessTokens?.delivery) {
      this.m_DeliveryClient = createDeliveryClient({
        space: this.options.spaceId,
        accessToken: this.options.accessTokens.delivery,
        host: 'cdn.contentful.com',
        environment: this.options.environmentId ?? this.options.defaultEnvironmentId ?? undefined,
        ...this.options.options
      });
    }
    else if (!this.m_DeliveryClient) {
      throw new Error(ContentfulApiService.DELIVERY_CLIENT_ERROR);
    }

    return this.m_DeliveryClient;
  }

  get previewClient(): ContentfulClientApi {
    if (!this.m_PreviewClient && this.options.options?.previewClient) {
      this.m_PreviewClient = this.options.options?.previewClient;
    }
    else if (!this.m_PreviewClient && this.options.accessTokens.preview) {
      this.m_PreviewClient = createDeliveryClient({
        space: this.options.spaceId,
        accessToken: this.options.accessTokens.preview,
        host: 'preview.contentful.com',
        environment: this.options.environmentId ?? this.options.defaultEnvironmentId ?? undefined,
        ...this.options.options
      });
    }
    else if (!this.m_PreviewClient) {
      throw new Error(ContentfulApiService.PREVIEW_CLIENT_ERROR);
    }

    return this.m_PreviewClient;
  }

  get managementClient(): ClientAPI {
    if (!this.m_ManagementClient) {
      throw new Error(ContentfulApiService.MANAGEMENT_CLIENT_ERROR);
    }

    return this.m_ManagementClient as ClientAPI;
  }

  public setManagementClient(client: ClientAPI) {
    this.m_ManagementClient = client;
  }

  public createManagementWithAccessToken(
    accessToken: string
  ): ClientAPI {
    const managementOptions: Partial<Record<string, any>> = {
      ...this.options.options
    }

    this.m_ManagementClient = createManagementClient({
      ...managementOptions,
      accessToken
    });

    return this.m_ManagementClient;
  }
}
