/**
 * There is no server to refresh from, so re-fetching the seed must not drop what the host added
 * this session: anything the fetch does not know about is kept, in the order it was added.
 *
 * Every list a pull-to-refresh can re-fetch goes through here — projects, properties and
 * marketplace searches all had their own copy of this before.
 */
export function mergeFetched<T extends { id: string }>(fetched: T[], current: T[]): T[] {
  const fetchedIds = new Set(fetched.map((row) => row.id));
  const added = current.filter((row) => !fetchedIds.has(row.id));
  return [...fetched, ...added];
}
