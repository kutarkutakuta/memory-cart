import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";
import { nanoid } from "nanoid";

/**
 * 買い物リスト
 */
export interface ShoppingList {
  id: number;
  url_key: string;
  order_number: number;
  name: string | null;
  memo: string | null;
  isShare: boolean;
  created_user: number | null;
  created_at: Date;
}

interface ShoppingListState {
  shoppingLists: ShoppingList[];
  loading: boolean;
  error: Error | null;
  fetchShoppingList: () => Promise<void>;
  addShoppingList: (copyItem?: ShoppingList) => void;
  removeShoppingList: (id: number) => void;
  updateShoppingList: (id: number, changes: { [keyPath: string]: any }) => void;
  sortShoppingList: (odlIndex: number, newIndex: number) => void;
  getShoppingList: (url_key: string) => Promise<ShoppingList | undefined>;
}

/**
 * 買い物リスト操作用Hook
 */
const useShoppingListStore = create<ShoppingListState>((set) => ({
  shoppingLists: [],
  loading: false,
  error: null,
  fetchShoppingList: async () => {
    set({ loading: true, error: null });
    try {
      // ローカルDBから取得
      const data = await localdb.shopping_lists
        .orderBy("order_number")
        .toArray();
      set({ shoppingLists: data });
      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  addShoppingList: (copyItem) => {
    const state = useShoppingListStore.getState().shoppingLists;

    const addItem: ShoppingList = {
      id:
        state.reduce((max, current) => {
          if (current.id > max) return current.id;
          else return max;
        }, 0) + 1,
      url_key: nanoid(),
      order_number: state.length + 1,
      name: copyItem ? copyItem.name : `買い物リスト${state.length + 1}`,
      memo: copyItem ? copyItem.memo : "",
      isShare: false,
      created_user: null,
      created_at: new Date(),
    };

    // ローカルDBへ追加
    localdb.shopping_lists.add(addItem).then(() => {
      // ステート更新
      set((state) => ({
        shoppingLists: [...state.shoppingLists, addItem],
      }));
    });
  },
  removeShoppingList: (id) => {
    // ローカルDBから削除
    localdb.shopping_lists.delete(id).then(() => {
      // ステート更新
      set((state) => {
        const m = state.shoppingLists.filter((n) => n.id !== id);
        return { shoppingLists: m };
      });
    });
  },
  updateShoppingList: (id, changes) => {
    localdb.shopping_lists.update(id, changes).then((m) => {
      set((state) => {
        const m = state.shoppingLists.map((n) => {
          return n.id === id ? { ...n, ...changes } : n;
        });
        return { shoppingLists: m };
      });
    });
  },
  sortShoppingList: (oldIndex, newIndex) => {
    const state = useShoppingListStore.getState().shoppingLists;
    const newLists = arrayMove(state, oldIndex, newIndex);

    newLists.forEach((list, i) => {
      list.order_number = i + 1;
      localdb.shopping_lists.update(list.id, list);
    });

    set(() => {
      return { shoppingLists: newLists };
    });
  },
  getShoppingList:async (url_key) => {
    set({ loading: true, error: null });
    try {
      // ローカルDBから取得
      const data = await localdb.shopping_lists
        .where({url_key})
        .first();
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error, loading: false });
    }
  }
}));

export default useShoppingListStore;
