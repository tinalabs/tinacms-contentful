import { useEffect } from "react";
import { CONTENTFUL_AUTH_TOKEN } from "./utils/contentful-client";

export const useContentfulAuthRedirect = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash);
    const code = urlParams.get("#access_token");
    localStorage[CONTENTFUL_AUTH_TOKEN] = code;
  }, []);
};
