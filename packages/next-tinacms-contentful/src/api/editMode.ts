import { NextApiRequest, NextApiResponse } from "next";
import { getCachedBearerToken } from "tinacms-contentful";
import { TOKEN_KEY } from './proxy';

export async function toggleEditing(enable: boolean, options?: {
  url?: string
}) {
  try {
    const req = {
      method: "POST",
      body: JSON.stringify({
        tina_enabled: enable,
        [TOKEN_KEY]: getCachedBearerToken() ?? null
      }),
    };
    const res = await fetch(options?.url ?? "/api/editing", req);

    if (!res.ok) {
      throw new Error(`Failed to set editing mode with: ${res.statusText}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message, error);
  }
}

export const getBearerTokenFromContext = (context: NextApiRequest) => {
  return context?.previewData?.[TOKEN_KEY] ?? null;
}

export const editModeHandler = (expires?: number) => (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body);
  const accessToken =
    body?.[TOKEN_KEY] ??
    req.previewData?.[TOKEN_KEY];
  const previewData = {
    ...req.previewData,
    tina_enabled: body.tina_enabled,
    contentful_bearer_token: accessToken
  };

  // If not enabling, exit "edit mode" by setting tina_enabled to false
  if (body.tina_enabled === false) {
    return res
      .setPreviewData(previewData)
      .status(200)
      .end();
  }

  // Enable edit mode by enabling Next.js preview mode and setting tina_enabled to true
  if (body.tina_enabled && accessToken) {
    return res
      .setPreviewData(previewData, {
        maxAge: expires ?? 60 * 60, // The preview mode cookies expire in 1 hour
      })
      .status(200)
      .end();
  }

  // No condition matched, something is wrong, exit "editing mode" by settinga tina_enabled to false
  return res.setPreviewData(previewData).status(500).end();
}

export default editModeHandler;