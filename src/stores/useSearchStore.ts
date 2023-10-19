import { create } from "zustand";
import localdb from "@/lib/localdb";
import { ShoppingItem } from "./useShoppingItemStore";
import { ShoppingList } from "./useShoppingListStore";

/**
 * 検索結果
 */
export interface SearchResult {
  shoppingList: ShoppingList;
  shoppingItems: ShoppingItem[];
}

interface SearchState {
  searchText: string;
  searchResults: SearchResult[];
  loading: boolean;
  error: Error | null;
  search: (text: string) => Promise<void>;
}

/**
 * 検索結果Hook
 */
const useSearchStore = create<SearchState>((set) => {
  return {
    searchText: "",
    searchResults: [],
    loading: false,
    error: null,
    search: async (searchText) => {
      set({ loading: true, error: null });
      try {
        if (searchText.length > 0) {
          // ローカルDBのデータを取得
          const items = await localdb.shopping_items
            .filter((m) => m.name.includes(searchText))
            .sortBy("list_key");

          const lists = await localdb.shopping_lists.toArray();
          const searchResults = lists
            .map((shoppingList) => {
              const shoppingItems = items.filter(
                (item) => item.list_key == shoppingList.list_key
              );
              return { shoppingList, shoppingItems };
            })
            .filter((result) => result.shoppingItems.length > 0);

          // ステート更新
          set({ searchText, searchResults });
        } else {
          // ステート更新
          set({ searchText, searchResults: [] });
        }
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
  };
});

export default useSearchStore;
