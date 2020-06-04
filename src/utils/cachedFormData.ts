export const setCachedFormData = (id: string, data: any) => {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(id, JSON.stringify(data));
};

export const getCachedFormData = (id: string) => {
  if (typeof localStorage === "undefined") {
    return {};
  }
  return JSON.parse(localStorage.getItem(id) || "{}");
};
