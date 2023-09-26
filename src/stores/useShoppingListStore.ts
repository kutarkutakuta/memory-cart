import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";
import { nanoid } from "nanoid";
import useShareStore from "./useShareStore";

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
  updateShoppingList: (
    id: number,
    changes: { [keyPath: string]: any }
  ) => Promise<void>;
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

    if (copyItem) {
      // ローカルDB買物品もコピーして追加
      const sourceItems = await localdb.shopping_items
        .where({
          shopping_list_id: copyItem.id.toString(),
        })
        .toArray();
      sourceItems.forEach((itm) => {
        itm.id = undefined;
        itm.shopping_list_id = new_list_id.toString();
        itm.buying_amount = undefined;
        itm.buying_unit = undefined;
        itm.buying_price = undefined;
        itm.finished_at = undefined;
        itm.finished_user = undefined;
        itm.created_at = new Date();
      });
      await localdb.shopping_items.bulkAdd(sourceItems);
    }

    // ステート更新
    set((state) => ({
      shoppingLists: [...state.shoppingLists, addItem],
    }));
  },
  removeShoppingList: async (id) => {
    const { shoppingLists } = useShoppingListStore.getState();
    const deleteList = shoppingLists.find((n) => n.id == id)!;

    // 先にDBを削除
    const { unShareList } = useShareStore.getState();
    await unShareList(deleteList.url_key);

    // ローカルDB買物品を削除
    const sourceItems = await localdb.shopping_items
      .where({
        shopping_list_id: id.toString(),
      })
      .toArray();
    await localdb.shopping_items.bulkDelete(sourceItems.map((itm) => itm.id!));

    // ローカルDBから削除
    await localdb.shopping_lists.delete(id);

    // ステート更新
    set((state) => {
      const m = state.shoppingLists.filter((n) => n.id !== id);
      return { shoppingLists: m };
    });
  },
  updateShoppingList: async (id, changes) => {

    // ローカルDBを更新
    await localdb.shopping_lists.update(id, changes);

    const { shoppingLists } = useShoppingListStore.getState();
    const newShoppingLists = shoppingLists.map((list) => {
      if (list.id === id) {
        list = { ...list, ...changes };
      }
      return list;
    });
    const newList = newShoppingLists.find((list) => list.id == id)!;
    const { shareList, unShareList } = useShareStore.getState();
    if (newList.isShare) {
      // 共有実行
      await shareList(newList);
    } else {
      // 共有解除
      await unShareList(newList.url_key);
    }

    // ステート更新
    set({ shoppingLists: newShoppingLists });
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
