import { create } from "zustand";
import localdb from "@/lib/localdb";

/**
 * お気に入り品
 */
export interface FavoriteItem {
  id?: number;
  order_number: number;
  name: string;
  category_name: string;
}

interface FavoriteItemState {
  favoriteItems: FavoriteItem[];
  loading: boolean;
  error: Error | null;
  fetchFavoriteItems: () => Promise<void>;
  addFavoriteItem: (category_name: string, name: string) => Promise<void>;
  updateFavoriteItem: (
    id: number,
    changes: { [keyPath: string]: any }
  ) => Promise<void>;
  removeFavoriteItem: (id: number) => Promise<void>;
  sortFavoriteItem: (favoriteItems: FavoriteItem[]) => void;
  getFavoriteItem: (name: string) => Promise<FavoriteItem | null>;
}

/**
 * お気に入り品操作用Hook
 */
const useFavoriteItemStore = create<FavoriteItemState>((set) => {
  return {
    favoriteItems: [],
    loading: false,
    error: null,
    fetchFavoriteItems: async () => {
      set({ loading: true, error: null});
      try {
        // ローカルDBのデータを取得
        let favorite_items = await localdb.favorite_items
        .orderBy("order_number")
        .toArray();

        // 買物リストのステート更新
        set({ favoriteItems: favorite_items });
      } catch (error: any) {
        set({ error, loading: false });
      } 
    },
    addFavoriteItem: async (category_name: string, name: string) => {
      set({ loading: true, error: null });
      try {
        
      const { favoriteItems } = useFavoriteItemStore.getState();

        const addItem: FavoriteItem = {
          category_name: category_name,
          order_number: favoriteItems.length + 1,
          name: name,
        };

        // ローカルDBへ追加
        const newId = await localdb.favorite_items.add(addItem);
        addItem.id = newId;

        // ステート更新
        set((state) => ({
          favoriteItems: [...state.favoriteItems, addItem],
        }));
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    updateFavoriteItem: async (id, changes) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBを更新
        await localdb.favorite_items.update(id, changes)

        // 共有の場合DBも更新
      const { favoriteItems } = useFavoriteItemStore.getState();
        const newItems = favoriteItems.map((n) => {
          return n.id === id
            ? { ...n, ...changes }
            : n;
        });
 
        // ステート更新
        set({ favoriteItems: newItems });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    removeFavoriteItem: async (id) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBから削除
        await localdb.favorite_items.delete(id);

        const { favoriteItems } = useFavoriteItemStore.getState();
        const newItems = favoriteItems.filter(
          (n) => n.id !== id
        );
        // ステート更新
        set({ favoriteItems: newItems });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    sortFavoriteItem: (favoriteItems) => {
      favoriteItems.forEach((item, i) => {
        item.order_number = i + 1;
        localdb.favorite_items.update(item.id!, item);
      });

      // ステート更新
      set({ favoriteItems });
    },
    getFavoriteItem :async  (name) =>{
      // ローカルDBのデータを取得
      const favorite_item = await localdb.favorite_items
      .where({name: name})
      .first();
      return favorite_item ? favorite_item : null;
    }
  };
});

export default useFavoriteItemStore;
