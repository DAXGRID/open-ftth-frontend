import { useState, useContext, KeyboardEvent, useRef } from "react";
import {
  GLOBAL_SEARCH_QUERY,
  GlobalSearch,
  SearchResult,
} from "./SearchMenuGql";
import { useQuery } from "urql";
import { useTranslation } from "react-i18next";
import { MapContext } from "../../../contexts/MapContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function SearchMenu() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string>("");
  const [searchFieldDirty, setSearchFieldDirty] = useState<boolean>(false);
  const { setSearchResult } = useContext(MapContext);
  const searchResultElementList = useRef<HTMLUListElement | null>(null);
  const searchInputElement = useRef<HTMLInputElement | null>(null);

  const [globalSearchResult] = useQuery<GlobalSearch>({
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

  const keyPressResultList = (
    e: KeyboardEvent<HTMLElement>,
    searchResult: SearchResult
  ) => {
    if (e.key === "Enter") {
      selectSearchResult(searchResult);
    } else if (e.key === "ArrowDown") {
      (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
    } else if (e.key === "ArrowUp") {
      if (!(e.currentTarget.previousElementSibling as HTMLElement)) {
        searchInputElement.current?.focus();
        // Hack because it won't move there without timeout
        setTimeout(() => {
          searchInputElement.current?.setSelectionRange(
            searchInputElement.current.value.length ?? 0,
            searchInputElement.current.value.length ?? 0
          );
        }, 1);
      } else {
        (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
      }
    }
  };

  const keyPressSearchInput = (
    e: KeyboardEvent<HTMLInputElement>,
    searchItems: SearchResult[]
  ) => {
    if (searchItems.length === 0) return;
    if (e.key === "Enter") {
      selectSearchResult(searchItems[0]);
    } else if (e.key === "ArrowUp") {
      // Hack because it won't move there without timeout
      setTimeout(() => {
        searchInputElement.current?.setSelectionRange(
          searchInputElement.current.value.length ?? 0,
          searchInputElement.current.value.length ?? 0
        );
      }, 1);
    } else if (e.key === "ArrowDown") {
      (
        searchResultElementList.current?.firstElementChild as HTMLElement
      )?.focus();
    }
  };

  const clearSearchText = () => {
    setSearchText("");
    searchInputElement.current?.focus();
  };

  const searchResult = globalSearchResult?.data?.search.globalSearch;

  return (
    <div className={"search-menu"}>
      <input
        className="search-menu-input"
        type="text"
        placeholder={t("SEARCH_FOR_ADDRESS_OR_NODE")}
        onKeyDown={(e) =>
          keyPressSearchInput(e, searchResult ? searchResult : [])
        }
        value={searchText}
        onChange={(x) => searchInput(x.target.value)}
        ref={searchInputElement}
      />

      <div className="search-menu-clear">
        <span role="button" onClick={() => clearSearchText()}>
          <FontAwesomeIcon icon={faTimes} />
        </span>
      </div>

      {searchText && searchFieldDirty && (
        <div className="search-menu-results">
          <ul ref={searchResultElementList}>
            {searchResult &&
              searchResult.map((x) => {
                return (
                  <li
                    role="button"
                    key={x.id}
                    tabIndex={0}
                    onKeyDown={(e) => keyPressResultList(e, x)}
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
