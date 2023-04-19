import { useCallback, useEffect, useState } from "react";

export function useAsync(fun, dependencies = []) {
  const { execute, ...state } = useAsyncInternal(fun, dependencies, true);
  useEffect(() => {
    execute();
  }, [execute]);
  return state;
}

export function useAsyncFn(fun, dependencies = []) {
  return useAsyncInternal(fun, dependencies, false);
}

function useAsyncInternal(fun, dependencies, initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState();
  const [value, setValue] = useState();
  const execute = useCallback((...params) => {
    setLoading(true);
    return fun(...params)
      .then((data) => {
        setValue(data);
        setError(undefined);
        return data;
      })
      .catch((error) => {
        setValue(undefined);
        setError(error);
        return Promise.reject(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, dependencies);
  return { loading, error, value, execute };
}
