import Cookies from "js-cookie";
import popupWindow from "../popupWindow";

export const CONTENTFUL_AUTH_TOKEN = "contentful_auth_token";

export interface ContentfulClientOptions {
  clientId: string;
  redirectUrl: string;
  space: string;
  proxy: string;
}

export class ContentfulClient {
  clientId: string;
  redirectUrl: string;
  space: string;
  proxy: string;

  constructor({
    clientId,
    redirectUrl,
    space,
    proxy,
  }: ContentfulClientOptions) {
    this.clientId = clientId;
    this.redirectUrl = redirectUrl;
    this.space = space;
    this.proxy = proxy;
  }

  authenticate() {
    return new Promise((resolve) => {
      let authTab: Window | undefined;
      const url = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${this.clientId}&redirect_uri=${this.redirectUrl}&scope=content_management_manage`;

      window.addEventListener("storage", function (e: StorageEvent) {
        if (e.newValue) {
          Cookies.set(CONTENTFUL_AUTH_TOKEN, e.newValue, {
            sameSite: "strict",
          });
        }

        if (authTab) {
          authTab.close();
        }
        resolve();
      });
      authTab = popupWindow(url, "_blank", window, 1000, 700);
    });
  }

  async fetchEntry(id: string) {
    return new Promise((resolve, reject) => {
      this.req({
        url: `https://api.contentful.com/spaces/raftynxu3gyd/environments/master/entries/${id}`,
        method: "GET",
        headers: {},
      })
        .then(function (response) {
          resolve(response.json());
        })
        .catch(function (e) {
          reject(e);
        });
    });
  }

  async fetchEntries(contentModel: string) {
    return new Promise((resolve, reject) => {
      this.req({
        url: `https://preview.contentful.com/spaces/${this.space}/environments/master/entries?content_type=${contentModel}`,
        method: "GET",
        headers: {},
      })
        .then(function (response) {
          resolve(response.json());
        })
        .catch(function (e) {
          reject(e);
        });
    });
  }

  async save(id: string, version: string, contentModel: string, fields: any) {
    console.log("Saving entity: ", id, fields);
    return this.req({
      url: `https://api.contentful.com/spaces/${this.space}/environments/master/entries/${id}`,
      method: "PUT",
      headers: {
        "X-Contentful-Content-Type": contentModel,
        "X-Contentful-Version": version,
        "Content-Type": "application/vnd.contentful.management.v1+json",
      },
      data: {
        fields: fields,
      },
    });
  }
  async req(data: any) {
    const response = await this.proxyRequest(data);
    return response;
  }

  proxyRequest(data: any) {
    return fetch(this.proxy, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
