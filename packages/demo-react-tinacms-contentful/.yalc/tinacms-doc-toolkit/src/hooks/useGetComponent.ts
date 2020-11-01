import { useEffect, useState } from "react";

export const useLoadComponent = (loadComponent: () => Promise<any>) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [Component, setComponent] = useState(undefined as any);

  useEffect(() => {
    const callLoadComponent = async () => {
      try {
        setLoading(true);

        const c = await loadComponent();

        if (c.default) {
          setComponent(c);
          setLoading(false);
        }
      } catch (error) {
        setError(error);
      }
    };

    callLoadComponent();
  }, [loadComponent]);

  return { Component, loading, error };
};
