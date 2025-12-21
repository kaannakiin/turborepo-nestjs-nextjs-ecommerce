import { SearchParams } from "types/GlobalTypes";

export const getServerSideAllSearchParams = (
  searchParams: Awaited<SearchParams>
) => {
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      urlSearchParams.append(key, String(value));
    }
  });
  return urlSearchParams.toString();
};
