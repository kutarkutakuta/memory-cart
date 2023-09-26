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
  addShoppingList: (copyItem?: ShoppingList) => Promise<void>;
  removeShoppingList: (id: number) => Promise<void>;
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
  addShoppingList: async (copyItem) => {
    const { shoppingLists } = useShoppingListStore.getState();

    const addItem: ShoppingList = {
      id:
        shoppingLists.reduce((max, current) => {
          if (current.id > max) return current.id;
          else return max;
        }, 0) + 1,
      url_key: nanoid(),
      order_number: shoppingLists.length + 1,
      name: `買い物リスト${shoppingLists.length + 1}`,
      memo: "",
      isShare: false,
      created_user: null,
      created_at: new Date(),
    };

    if (copyItem) {
      addItem.name = copyItem.name + "_コピー";
      addItem.memo = copyItem.memo;
    }

    // ローカルDBへ追加
    const new_list_id = await localdb.shopping_lists.add(addItem);

    // ステート更新
    set((state) => ({
      shoppingLists: [...state.shoppingLists, addItem],
    }));

    if (copyItem) {
      // 買物品もコピー
      const sourceItems = await localdb.shopping_items.where({
        shopping_list_id: copyItem.id.toString(),
      }).toArray();
      sourceItems.forEach(itm=> {
        itm.id = undefined;
        itm.shopping_list_id = new_list_id.toString();
        itm.buying_amount = undefined;
        itm.buying_unit = undefined;
        itm.buying_price = undefined;
        itm.finished_at = undefined;
        itm.finished_user = undefined;
        itm.created_at = new Date();
      })
      await localdb.shopping_items.bulkAdd(sourceItems);
    }
  },
  removeShoppingList:async (id) => {

    // ローカルDBから削除
    await localdb.shopping_lists.delete(id);

    // 買物品も削除
    const sourceItems = await localdb.shopping_items.where({
      shopping_list_id: id.toString(),
    }).toArray();
    await localdb.shopping_items.bulkDelete(sourceItems.map(itm=>itm.id!));

    // ステート更新
    set((state) => {
      const m = state.shoppingLists.filter((n) => n.id !== id);
      return { shoppingLists: m };
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
  getShoppingList: async (url_key) => {
    set({ loading: true, error: null });
    try {
      // ローカルDBから取得
      const data = await localdb.shopping_lists.where({ url_key }).first();
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
}));

export default useShoppingListStore;
