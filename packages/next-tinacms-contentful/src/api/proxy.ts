import { NextApiRequest, NextApiResponse } from "next";

const CONTENTFUL_DELIVERY_CDN = "cdn.contentful.com";
const CONTENTFUL_PREVIEW_CDN = "preview.contentful.com";
const CONTENTFUL_MANAGEMENT_CDN = "api.contentful.com";

export const TOKEN_KEY = "contentful_bearer_token";

/**
 * Takes a Next.js req object and returns the spaceId from the URL (if present)
 * 
 * @param req 
 * @returns
 */
export function getSpaceIdFromReq(req: NextApiRequest) {
  const path = req?.url?.replace("/api/proxy", '');

  if (!path) return null;

  const matches = /^\/spaces\/(.*?)\/.*?$/.exec(path)
  const spaceId = matches?.[1] ?? null;

  return spaceId;
}

type ProxyEndpoint = "delivery" | "preview" | "management"

export interface ProxyOptions {
  basePath?: string,
  endpoint?: ProxyEndpoint,
  middleware?: boolean
  accessTokens: {
    delivery: string;
    preview: string;
    management: string;
  },
}

/**
 * Forwards requests along to Contentful, but provides access to
 * server-side tokens and Next.js's preview data.
 * 
 * Uses access tokens in this order:
 * - Uses delivery, preview token provided, otherwise the one sent in the client-side request headers
 * - Uses management stored in preview data, otherwise provided, otherwise the one sent in the client-side request headers
 * 
 * @param req 
 * @returns
 */
export function proxy(options: ProxyOptions) {
  return async <ResponseShape extends any>(req: NextApiRequest, res: NextApiResponse) => {
    try {
      const {url, request} = getProxyRequest(req, options);
      const response = await fetch(url, request);
      const data = await response.json();

      if (!options.middleware) {
        return res
          .status(200)
          .json(data) as ResponseShape;
      }

      return data as ResponseShape;
    } catch (error) {
      res.statusMessage = error.message;

      return res
        .status(500)
    }
  }
}

function getProxyRequest(req: NextApiRequest, options: ProxyOptions) {
  const mode = options.endpoint
    ? options.endpoint
    : (req.preview)
      ? "preview"
      : "delivery";
  const endpoint =
    mode === "delivery" && CONTENTFUL_DELIVERY_CDN ||
    mode === "preview" && CONTENTFUL_PREVIEW_CDN ||
    mode === "management" && CONTENTFUL_MANAGEMENT_CDN ||
    null;
  const accessToken =
    endpoint === CONTENTFUL_DELIVERY_CDN && options.accessTokens.delivery ||
    endpoint === CONTENTFUL_PREVIEW_CDN && options.accessTokens.preview ||
    endpoint === CONTENTFUL_MANAGEMENT_CDN && req.previewData[TOKEN_KEY] ||
    endpoint === CONTENTFUL_MANAGEMENT_CDN && options.accessTokens.management ||
    req.headers.authorization?.replace("Bearer ", "");
  
  if (!req.url)
    throw new Error("Could not resolve req url");
  
  if (endpoint === null)
    throw new Error(`Invalid host in ${req?.url}`);
  
  const url = req.url
    ?.replace(/^.*?\/\/(.*?)\/.*?/, endpoint)
    ?.replace(options?.basePath ?? '', '')
  const request: RequestInit = {
    body: req.body,
    headers: {
      ...req.headers as Record<string, string>,
      authorization: `Bearer ${accessToken}`
    },
    method: req.method
  }
  
  return {url, request};
}