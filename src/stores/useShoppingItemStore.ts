import { create } from "zustand";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";
import useMasterStore from "./useMasterStore";
import {} from "swr";
import { nanoid } from "nanoid";
import { ShoppingList } from "./useShoppingListStore";

/**
 * 買い物品
 */
export interface ShoppingItem {
  id?: number;
  list_key: string;
  item_key: string;
  order_number: number;
  name: string;
  category_name?: string;
  amount?: number;
  unit?: string;
  priority?: string;
  memo?: string;
  buying_amount?: number;
  buying_unit?: string;
  buying_price?: number;
  created_user?: string;
  created_at?: Date;
  finished_user?: string;
  finished_at?: Date | null;
}

interface ShoppingItemState {
  shoppingList: ShoppingList | null;
  shoppingItems: ShoppingItem[];
  loading: boolean;
  error: Error | null;
  fetchShoppingItems: (list_key: string) => Promise<void>;
  clearShoppingItems: () => void;
  addShoppingItem: (list_key: string, name: string) => Promise<void>;
  removeShoppingItem: (id: number) => Promise<void>;
  updateShoppingItem: (
    id: number,
    changes: { [keyPath: string]: any }
  ) => Promise<void>;
  finishShoppingItem: (id: number) => Promise<void>;
  sortShoppingItem: (shoppingItems: ShoppingItem[]) => void;
  syncShoppingItem: (list_key: string) => Promise<void>;
  startPolling: (list_key: string) => void;
}

/**
 * 買い物品操作用Hook
 */
const useShoppingItemStore = create<ShoppingItemState>((set) => {
  let pollTimer: NodeJS.Timeout;

  return {
    shoppingList: null,
    shoppingItems: [],
    loading: false,
    error: null,
    fetchShoppingItems: async (list_key) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBから取得
        const lst = await localdb.shopping_lists
          .filter((m) => m.list_key == list_key)
          .first();
        const items = await localdb.shopping_items
          .orderBy("order_number")
          .filter((m) => m.list_key == list_key)
          .toArray();
        set({ shoppingList: lst });
        set({ shoppingItems: items });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    clearShoppingItems: () => {
      set({ shoppingItems: [] });
      // ポーリングも停止！
      clearTimeout(pollTimer);
    },
    addShoppingItem: async (list_key, name) => {
      set({ loading: true, error: null });
      try {
        // マスター用Hook
        const { commonItems } = useMasterStore.getState();

        // 追加データ
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();
        const addItem: ShoppingItem = {
          list_key: list_key,
          item_key: nanoid(),
          order_number: shoppingItems.length + 1,
          name: name,
          category_name: commonItems.find((m) => m.name == name)
            ?.category_name!,
          created_at: new Date(),
        };

        // ローカルDBへ追加
        const newId = await localdb.shopping_items.add(addItem);
        addItem.id = newId;

        // 共有の場合サーバDBにも追加
        if (shoppingList!.isShare) {
          const { error } = await supabase.from("shopping_items").insert({
            list_key: addItem.list_key,
            item_key: addItem.item_key,
            order_number: addItem.order_number,
            name: addItem.name,
            category_name: addItem.category_name,
            created_user: "GUEST",
          });
          if (error) throw error;
        }

        // ステート更新
        set((state) => ({
          shoppingItems: [...state.shoppingItems, addItem],
        }));
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    removeShoppingItem: async (id) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBから削除
        await localdb.shopping_items.delete(id);

        // 共有の場合DBも更新
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();
        const deleteItem = shoppingItems.find((n) => n.id == id)!;
        if (shoppingList!.isShare) {
          // 共有済みなのでリストのデータを更新するだけ
          const { error } = await supabase
            .from("shopping_items")
            .delete()
            .eq("list_key", deleteItem.list_key)
            .eq("item_key", deleteItem.item_key);
          if (error) throw error;
        }

        // ステート更新
        set((state) => {
          const m = state.shoppingItems.filter((n) => n.id !== id);
          return { shoppingItems: m };
        });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    updateShoppingItem: async (id, changes) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBを更新
        await localdb.shopping_items.update(id, changes);

        // 共有の場合DBも更新
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();
        const newItems = shoppingItems.map((n) => {
          return n.id === id ? { ...n, ...changes } : n;
        });
        const newItem = newItems.find((n) => n.id == id)!;
        if (shoppingList!.isShare) {
          // 共有済みなのでリストのデータを更新するだけ
          const { error } = await supabase
            .from("shopping_items")
            .update(changes)
            .eq("list_key", newItem.list_key)
            .eq("item_key", newItem.item_key);
          if (error) throw error;
        }

        // ステート更新
        set({ shoppingItems: newItems });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    finishShoppingItem: async (id) => {
      const changes = { finished_at: new Date() };
      const { updateShoppingItem } = useShoppingItemStore.getState();
      await updateShoppingItem(id, changes);
    },
    sortShoppingItem: (shoppingItems) => {
      shoppingItems.forEach((item, i) => {
        item.order_number = i + 1;
        localdb.shopping_items.update(item.id!, item);
      });

      // ステート更新
      set({ shoppingItems });
    },
    syncShoppingItem: async (list_key) => {
      set({ loading: true, error: null });
      try {
        // DBからデータ取得
        const { data, error: erro1 } = await supabase
          .from("shopping_items")
          .select("*")
          .eq("list_key", list_key);
        // オフラインの可能性があるのでThrowしない
        if (erro1) console.error(erro1);

        // ローカルDBへ反映
        if (data && data.length > 0) {
          // DBがあれば同期　存在しない場合は同期しない
          for (const serverData of data) {
            // ローカルDBから取得
            const localData = await localdb.shopping_items
              .filter(
                (m) =>
                  m.list_key == list_key && m.item_key == serverData["item_key"]
              )
              .first();

            if (localData) {
              // 差分があれば更新
              const changes: any = {};
              if (serverData["name"] != localData.name)
                changes["name"] = serverData["name"];
              if (serverData["category_name"] != localData.category_name)
                changes["category_name"] = serverData["category_name"];
              if (serverData["amount"] != localData.amount)
                changes["amount"] = serverData["amount"];
              if (serverData["unit"] != localData.unit)
                changes["unit"] = serverData["unit"];
              if (serverData["priority"] != localData.priority)
                changes["priority"] = serverData["priority"];
              if (serverData["memo"] != localData.memo)
                changes["memo"] = serverData["memo"];
              if (serverData["buying_amount"] != localData.buying_amount)
                changes["buying_amount"] = serverData["buying_amount"];
              if (serverData["buying_unit"] != localData.buying_unit)
                changes["buying_unit"] = serverData["buying_unit"];
              if (serverData["buying_price"] != localData.buying_price)
                changes["buying_price"] = serverData["buying_price"];
              if (serverData["finished_user"] != localData.finished_user)
                changes["finished_user"] = serverData["finished_user"];
              if (serverData["finished_at"] != localData.finished_at)
                changes["finished_at"] = serverData["finished_at"];

              if (Object.keys(changes).length > 0) {
                await localdb.shopping_items.update(localData.id!, changes);
              }
            } else {
              // 追加
              const addItem: ShoppingItem = {
                list_key: list_key,
                item_key: serverData["item_key"],
                order_number: serverData["order_number"],
                name: serverData["name"],
                category_name: serverData["category_name"],
                amount: serverData["amount"],
                unit: serverData["unit"],
                priority: serverData["priority"],
                memo: serverData["memo"],
                buying_amount: serverData["buying_amount"],
                buying_unit: serverData["buying_unit"],
                buying_price: serverData["buying_price"],
                created_user: serverData["created_user"],
                created_at: serverData["created_at"],
                finished_user: serverData["finished_user"],
                finished_at: serverData["finished_at"],
              };
              await localdb.shopping_items.add(addItem);
            }
          }

          const deleteItems = await localdb.shopping_items
            .filter(
              (itm) =>
                itm.list_key == list_key &&
                data.findIndex((d) => d.item_key == itm.item_key) == -1
            )
            .toArray();
          if (deleteItems.length > 0) {
            await localdb.shopping_items.bulkDelete(
              deleteItems.map((itm) => itm.id!)
            );
          }
        } else {
          // データがないということは共有が切れた可能性があるのでチェックする。
          const { data } = await supabase
            .from("shopping_lists")
            .select("*")
            .eq("list_key", list_key);
          if (!data || data.length == 0) {
            // ローカルDBの共有を解除
            const shopping_list = await localdb.shopping_lists
              .filter((m) => m.list_key == list_key)
              .first();
            if (shopping_list) {
              const changes = { isShare: false };
              await localdb.shopping_lists.update(shopping_list.id, changes);
              shopping_list.isShare = false;
              set({ shoppingList: shopping_list });
            }
            // メッセージを返すためにthrow
            throw new Error(
              "サーバーにデータが存在しないため共有が解除されました。"
            );
          }
        }
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      } finally {
        // フェッチしなおし
        const { fetchShoppingItems } = useShoppingItemStore.getState();
        await fetchShoppingItems(list_key);
      }
    },
    startPolling: (list_key) => {
      const { syncShoppingItem } = useShoppingItemStore.getState();
      const poll = async () => {
        await syncShoppingItem(list_key);
        pollTimer = setTimeout(poll, 5000);
      };
      poll();
    },
  };
});

export default useShoppingItemStore;
