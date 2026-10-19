import { useCallback, useEffect, useState } from 'react';
import { useLocalData } from './LocalDataProvider';

export function useLocalCollection(tableName) {
  const { repositories, status, ready = true } = useLocalData();
  const repository = repositories?.[tableName];
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(ready !== false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!repository) {
      setData([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setData(await repository.list((record) => !record.deletedAt));
      setError(null);
    } catch (nextError) {
      if (nextError?.name !== 'DatabaseClosedError') setError(nextError);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    if (ready === false) {
      setIsLoading(true);
      return;
    }
    refresh();
  }, [refresh, ready, status.lastSyncAt]);

  const create = async (input) => {
    const record = await repository.create(input);
    await refresh();
    return record;
  };
  const update = async (id, patch) => {
    const record = await repository.update(id, patch);
    await refresh();
    return record;
  };
  const remove = async (id) => {
    await repository.remove(id);
    await refresh();
  };

  return { data, isLoading, error, refresh, create, update, remove, repository };
}
