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
  list_key: string;
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
  getShoppingList: (list_key: string) => Promise<ShoppingList | undefined>;
  shareShoppingList: (id: number) => Promise<void>;
  unShareShoppingList: (id: number) => Promise<void>;
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

      // TODO:共有中の場合サーバをチェックしてなければ共有解除

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
      list_key: nanoid(),
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
    await localdb.shopping_lists.add(addItem);

    if (copyItem) {
      // ローカルDB買物品もコピーして追加
      const sourceItems = await localdb.shopping_items
        .where({
          list_key: copyItem.list_key,
        })
        .toArray();
      sourceItems.forEach((itm) => {
        itm.id = undefined;
        itm.list_key = addItem.list_key;
        (itm.item_key = nanoid()), (itm.buying_amount = undefined);
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
    await unShareList(deleteList.list_key);

    // ローカルDB買物品を削除
    const sourceItems = await localdb.shopping_items
      .where({
        list_key: deleteList.list_key,
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
    set({ loading: true, error: null });

    try {
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
      if (newList.isShare) {
        // サーバDBも更新
        const { error: error1 } = await supabase
          .from("shopping_lists")
          .update({
            list_key: newList.list_key,
            name: newList.name,
            memo: newList.memo,
          })
          .eq("list_key", newList.list_key);
        if (error1) throw error1;
      }

      // ステート更新
      set({ shoppingLists: newShoppingLists });
      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
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
  getShoppingList: async (list_key) => {
    set({ loading: true, error: null });
    try {
      // ローカルDBから取得
      const data = await localdb.shopping_lists.where({ list_key }).first();
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  shareShoppingList: async (id) => {
    set({ loading: true, error: null });

    try {
      // 買い物リスト操作用Hook
      const { shoppingLists } = useShoppingListStore.getState();

      // ローカルの買物リストを取得
      const localList = shoppingLists.find(
        (lst) => lst.id == id
      ) as ShoppingList;

      // list_keyを更新！！
      const new_list_key = nanoid();

      // サーバDBに買物リストを追加
      const { error: error1 } = await supabase.from("shopping_lists").insert({
        list_key: new_list_key,
        name: localList.name,
        memo: localList.memo,
        created_user: "GUEST",
      });
      if (error1) throw error1;

      // サーバDBに品物を追加
      const localItems = await localdb.shopping_items
        .where({ list_key: localList.list_key })
        .toArray();
      const { error: error2 } = await supabase.from("shopping_items").insert(
        localItems.map((d) => ({
          list_key: new_list_key,
          item_key: d.item_key,
          order_number: d.order_number,
          name: d.name,
          category_name: d.category_name,
          amount: d.amount,
          unit: d.unit,
          priority: d.priority,
          memo: d.memo,
          buying_amount: d.buying_amount,
          buying_unit: d.buying_unit,
          buying_price: d.buying_price,
          created_user: "GUEST",
          finished_user: d.finished_user,
          finished_at: d.finished_at,
        }))
      );
      if (error2) throw error2;

      // ローカルDBを更新
      const changes = { list_key: new_list_key, isShare: true };
      await localdb.shopping_lists.update(id, changes);
      localItems.forEach(async (itm) => {
        await localdb.shopping_items.update(itm.id!, {
          list_key: new_list_key,
        });
      });

      const newShoppingLists = shoppingLists.map((lst) => {
        if (lst.id === id) {
          lst = { ...lst, ...changes };
        }
        return lst;
      });
      set({ shoppingLists: newShoppingLists });
      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  unShareShoppingList: async (id) => {
    set({ loading: true, error: null });
    try {
      // 買い物リスト操作用Hook
      const { shoppingLists } = useShoppingListStore.getState();
      // ローカルの買物リストを取得
      const localList = shoppingLists.find(
        (lst) => lst.id == id
      ) as ShoppingList;

      // サーバDBの買物リストを削除
      const { error: error1 } = await supabase
        .from("shopping_items")
        .delete()
        .eq("list_key", localList.list_key);
      if (error1) throw error1;

      // サーバDBの品物を削除
      const { error: error2 } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("list_key", localList.list_key);
      if (error2) throw error2;

      // ローカルDBを更新
      const changes = { isShare: false };
      await localdb.shopping_lists.update(id, changes);
      const newShoppingLists = shoppingLists.map((lst) => {
        if (lst.id === id) {
          lst = { ...lst, ...changes };
        }
        return lst;
      });

      // ステート更新
      set({ shoppingLists: newShoppingLists });
      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
}));

export default useShoppingListStore;
