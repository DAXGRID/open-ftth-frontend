import { useState, useContext } from "react";
import {
  GLOBAL_SEARCH_QUERY,
  GlobalSearch,
  SearchResult,
} from "./SearchMenuGql";
import { useQuery } from "urql";
import { useTranslation } from "react-i18next";
import { MapContext } from "../../../contexts/MapContext";

function SearchMenu() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string>("");
  const [searchFieldDirty, setSearchFieldDirty] = useState<boolean>(false);
  const { setSearchResult } = useContext(MapContext);

  const [diagramQueryResult] = useQuery<GlobalSearch>({
    query: GLOBAL_SEARCH_QUERY,
    variables: {
      searchString: searchText,
      pageSize: 10,
    },
    pause: !searchText,
  });

  const selectSearchResult = (searchResult: SearchResult) => {
    setSearchText(searchResult.label);
    setSearchFieldDirty(false);
    setSearchResult(searchResult);
  };

  const searchInput = (text: string) => {
    setSearchText(text);
    setSearchFieldDirty(true);
  };

  return (
    <div className="search-menu">
      <input
        className="search-menu-input"
        type="text"
        placeholder={t("SEARCH_FOR_ADDRESS_OR_NODE")}
        value={searchText}
        onChange={(x) => searchInput(x.target.value)}
      />

      {searchText && searchFieldDirty && (
        <div className="search-menu-results">
          <ul>
            {diagramQueryResult.data?.search?.globalSearch &&
              diagramQueryResult.data?.search?.globalSearch.map((x) => {
                return (
                  <li
                    role="button"
                    key={x.id}
                    onClick={() => selectSearchResult(x)}
                  >
                    {x.label}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchMenu;
