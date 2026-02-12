import { useCallback, useEffect, useState } from 'react';

import { MeshInfoJson } from '../types';

// parse the json file by a hook which will take a url and parse the json and return the object
export const useJsonParser = (url: string | undefined | null) => {
  const [state, setState] = useState({
    data: null as MeshInfoJson | null,
    error: null as string | null,
    loading: false,
  });

  const loader = useCallback(async () => {
    if (!url) {
      setState({ data: null, error: null, loading: false });
      return;
    }

    setState((prev) => ({ ...prev, error: null, loading: true }));

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch JSON: ${response.status} ${response.statusText}`,
        );
      }

      const jsonData = await response.json();

      // Validate that the JSON has all required properties for MeshInfoJson
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON: Expected an object');
      }

      if (!jsonData.glbUrl || typeof jsonData.glbUrl !== 'string') {
        throw new Error('Invalid JSON: Missing or invalid glbUrl property');
      }

      if (!Array.isArray(jsonData.availableColors)) {
        throw new Error('Invalid JSON: availableColors must be an array');
      }

      // Validate that all colors are strings
      const invalidColors = jsonData.availableColors.filter(
        (color: string) => typeof color !== 'string',
      );
      if (invalidColors.length > 0) {
        throw new Error('Invalid JSON: All availableColors must be strings');
      }

      setState({
        data: jsonData as MeshInfoJson,
        error: null,
        loading: false,
      });
    } catch (error) {
      setState({
        data: null,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false,
      });
    }
  }, [url]);

  useEffect(() => {
    loader();
  }, [loader]);

  return state;
};
