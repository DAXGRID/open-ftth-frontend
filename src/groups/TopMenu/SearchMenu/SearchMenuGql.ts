export interface GlobalSearch {
  search: {
    globalSearch: SearchResult[];
  };
}

export interface SearchResult {
  id: string;
  objectType: string;
  label: string;
  xwgs: number;
  ywgs: number;
  xetrs: number;
  yetrs: number;
}

export const GLOBAL_SEARCH_QUERY = `
query ($searchString: String!, $pageSize: Int!)
{
  search {
    globalSearch(searchString: $searchString pageSize: $pageSize)
    {
      id,
      objectType,
      label,
      xwgs,
      ywgs,
      xetrs,
      yetrs
    }
  }
}`;
