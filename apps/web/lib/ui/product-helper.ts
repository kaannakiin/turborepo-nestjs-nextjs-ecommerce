import { SearchParams } from "types/GlobalTypes";

export const getServerSideAllSearchParams = (
  searchParams: Awaited<SearchParams>,
  excludeKeys: string[] = []
) => {
  const urlSearchParams = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && !excludeKeys.includes(key)) {
      urlSearchParams.append(key, String(value));
    }
  });

  return urlSearchParams.toString();
};
