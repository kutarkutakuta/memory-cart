import { create } from "zustand";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";
import useMasterStore from "./useMasterStore";
import {} from "swr";
import { nanoid } from "nanoid";
import { ShoppingList } from "./useShoppingListStore";
import useFavoriteItemStore from "./useFavoriteItemStore";

/**
 * 買い物品
 */
export interface ShoppingItem {
  id?: number;
  list_key: string;
  item_key: string;
  order_number: number;
  name: string;
  category_name?: string | null;
  amount?: number | null;
  unit?: string | null;
  priority?: string | null;
  memo?: string | null;
  buying_amount?: number | null;
  buying_unit?: string | null;
  buying_price?: number | null;
  finished_user?: string | null;
  finished_at?: Date | null;
  created_user: string | null;
  updated_user: string | null;
}

interface ShoppingItemState {
  shoppingList: ShoppingList | null;
  shoppingItems: ShoppingItem[];
  loading: boolean;
  error: Error | null;
  info: string | null;
  fetchShoppingItems: (list_key: string) => Promise<void>;
  clearShoppingItems: () => void;
  addShoppingItem: (list_key: string, name: string) => Promise<void>;
  updateShoppingItems: (
    ids: number[],
    changes: { [keyPath: string]: any }
  ) => Promise<void>;
  removeShoppingItems: (ids: number[]) => Promise<void>;
  sortShoppingItem: (shoppingItems: ShoppingItem[]) => void;
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
    info: null,
    fetchShoppingItems: async (list_key) => {
      set({ loading: true, error: null, info: null });
      try {
        // ローカルDBのデータを取得
        let local_list = await localdb.shopping_lists
          .filter((m) => m.list_key == list_key)
          .first();

        // ローカル共有なし　→　スルー
        // ローカル共有ありサーバー接続不可　→　スルー
        // ローカル共有ありサーバーあり　→　共有中であればサーバーからローカルへ同期
        // ローカル共有ありサーバーなし　→　共有中であれば共有解除
        // ローカルなしサーバーあり　→　共有作成
        // ローカルなしサーバーなし　→　データなしエラー
        // エラーでなければステート更新

        if (local_list && local_list.isShare) {
          // サーバーDBのデータを取得
          const {
            data: server_list,
            error,
            status: server_status,
          } = await supabase
            .from("shopping_lists")
            .select("*")
            .eq("list_key", list_key)
            .single();
          if (error) console.error(error);

          if (server_status !== 200) {
            // なにもしないでスルー
            // throw new Error("サーバーに接続できません");
          } else if (server_list) {
            // サーバーからローカルへ同期
            fetchFromServer(local_list, server_list);
          } else {
            // 共有解除
            await localdb.shopping_lists.update(local_list.id, {
              isShare: false,
            });
            set({
              info: "サーバーにデータが存在しないため共有を解除しました。",
            });
          }
        } else if (!local_list) {
          // サーバーDBのデータを取得
          const { data: server_list, error } = await supabase
            .from("shopping_lists")
            .select("*")
            .eq("list_key", list_key)
            .single();
          if (error) console.error(error);
          if (!server_list) {
            throw new Error("データが存在しません");
          }

          // 共有作成
          local_list = await addFromShareKey(list_key);

          set({ info: "共有データから買物リストが作成されました。" });
        }

        // 買物リストのステート更新
        set({ shoppingList: local_list });
      } catch (error: any) {
        set({ error, loading: false });
      } finally {
        // 品物のステート更新
        const items = await localdb.shopping_items
          .orderBy("order_number")
          .filter((m) => m.list_key == list_key)
          .toArray();
        set({ shoppingItems: items });
        set({ loading: false });
      }
    },
    clearShoppingItems: () => {
      set({
        shoppingList: null,
        shoppingItems: [],
        error: null,
        info: null,
        loading: false,
      });
      // ポーリングも停止！
      clearTimeout(pollTimer);
    },
    addShoppingItem: async (list_key, name) => {
      set({ loading: true, error: null });
      try {
        // マスター用Hook
        const { appSetting, commonItems } = useMasterStore.getState();
        // お気に入り品用Hook
        const { favoriteItems } = useFavoriteItemStore.getState();

        // 名称からカテゴリを取得
        const categroy_name =
          favoriteItems.find((itm) => itm.name == name)?.category_name ||
          commonItems.find((m) => m.name == name)?.category_name;

        // 追加データ
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();
        const addItem: ShoppingItem = {
          list_key: list_key,
          item_key: nanoid(),
          order_number: shoppingItems.length + 1,
          name: name,
          category_name: categroy_name,
          created_user: appSetting?.user_name!,
          updated_user: appSetting?.user_name!,
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
            created_user: appSetting?.user_name!,
            updated_user: appSetting?.user_name!,
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
    updateShoppingItems: async (ids, changes) => {
      set({ loading: true, error: null });
      try {
        // 更新情報をマージ
        const { appSetting } = useMasterStore.getState();
        changes = {
          ...changes,
          ...{
            updated_user: appSetting?.user_name!,
          },
        };

        // ローカルDBを更新
        ids.forEach(
          async (id) => await localdb.shopping_items.update(id, changes)
        );

        // ステート更新用の変数を準備
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();
        const newItems = shoppingItems.map((n) => {
          return ids.findIndex((id) => id === n.id) > -1
            ? { ...n, ...changes }
            : n;
        });

        if (shoppingList && shoppingList.isShare) {
          // 共有済みなのでリストのデータを更新するだけ
          const { error } = await supabase
            .from("shopping_items")
            .update(changes)
            .eq("list_key", shoppingList.list_key)
            .in(
              "item_key",
              newItems
                .filter((itm) => ids.findIndex((id) => id === itm.id) > -1)
                .map((itm) => itm.item_key)
            );
          if (error) throw error;
        }

        // ステート更新
        set({ shoppingItems: newItems });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    removeShoppingItems: async (ids) => {
      set({ loading: true, error: null });
      try {
        // ローカルDBから削除
        ids.forEach(async (id) => await localdb.shopping_items.delete(id));

        // 共有の場合DBも削除
        const { shoppingList, shoppingItems } = useShoppingItemStore.getState();

        const deleteItems = shoppingItems.filter((n) => {
          return ids.findIndex((id) => id === n.id) > -1;
        });

        if (shoppingList && shoppingList.isShare) {
          const { error } = await supabase
            .from("shopping_items")
            .delete()
            .eq("list_key", shoppingList.list_key)
            .in(
              "item_key",
              deleteItems.map((itm) => itm.item_key)
            );
          if (error) throw error;
        }

        const newItems = shoppingItems.filter(
          (n) => ids.findIndex((id) => id === n.id) === -1
        );
        // ステート更新
        set({ shoppingItems: newItems });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    sortShoppingItem: (shoppingItems) => {
      shoppingItems.forEach((item, i) => {
        item.order_number = i + 1;
        localdb.shopping_items.update(item.id!, item);
      });

      // ステート更新
      set({ shoppingItems });
    },
    startPolling: (list_key) => {
      const { fetchShoppingItems } = useShoppingItemStore.getState();
      const poll = async () => {
        await fetchShoppingItems(list_key);
        pollTimer = setTimeout(poll, 5000);
      };
      poll();
    },
  };
});

/**
 * サーバーからローカルへ同期
 * @param local_list
 * @param server_list
 */
const fetchFromServer = async (local_list: ShoppingList, server_list: any) => {
  // ローカルの買物リストを更新
  await localdb.shopping_lists.update(local_list.id!, {
    name: server_list.name,
    memo: server_list.memo,
  });

  // サーバーDBからデータ取得
  const { data, error: erro1 } = await supabase
    .from("shopping_items")
    .select("*")
    .eq("list_key", local_list.list_key);
  // オフラインの可能性があるのでThrowしない
  if (erro1) console.error(erro1);

  // サーバーDBからデータ取得できたらローカルDBへ反映
  // データが存在しない場合は同期しない（全部消えちゃうので）
  if (data && data.length > 0) {
    for (const serverData of data) {
      // ローカルDBから取得
      const localData = await localdb.shopping_items
        .filter(
          (m) =>
            m.list_key == local_list.list_key &&
            m.item_key == serverData["item_key"]
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
          changes["finished_at"] = serverData.finished_at
            ? new Date(serverData.finished_at)
            : null;
        if (serverData["updated_user"] != localData.updated_user)
          changes["updated_user"] = serverData["updated_user"];

        if (Object.keys(changes).length > 0) {
          await localdb.shopping_items.update(localData.id!, changes);
        }
      } else {
        // 追加
        const addItem: ShoppingItem = {
          list_key: local_list.list_key,
          item_key: serverData.item_key,
          order_number: serverData.order_number,
          name: serverData.name,
          category_name: serverData.category_name,
          amount: serverData.amount,
          unit: serverData.unit,
          priority: serverData.priority,
          memo: serverData.memo,
          buying_amount: serverData.buying_amount,
          buying_unit: serverData.buying_unit,
          buying_price: serverData.buying_price,
          finished_user: serverData.finished_user,
          finished_at: serverData.finished_at
            ? new Date(serverData.finished_at)
            : null,
          created_user: serverData.created_user,
          updated_user: serverData.updated_user,
        };
        await localdb.shopping_items.add(addItem);
      }
    }

    const deleteItems = await localdb.shopping_items
      .filter(
        (itm) =>
          itm.list_key == local_list.list_key &&
          data.findIndex((d) => d.item_key == itm.item_key) == -1
      )
      .toArray();
    if (deleteItems.length > 0) {
      await localdb.shopping_items.bulkDelete(
        deleteItems.map((itm) => itm.id!)
      );
    }
  }
};

/**
 * 共有キーから買い物リストと品物を作成
 * @param list_key
 */
export const addFromShareKey = async (list_key: string) => {
  // ローカルDBから取得
  const shoppingLists = await localdb.shopping_lists
    .orderBy("order_number")
    .toArray();

  // サーバーDBから買い物リストを取得
  const { data: listData, error: erro1 } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("list_key", list_key)
    .single();
  if (erro1) {
    console.error(erro1);
    throw new Error("サーバーに接続できないか共有データが存在しません。");
  }

  if (listData) {
    if (shoppingLists.findIndex((m) => m.list_key == list_key) > -1) {
      throw new Error("共有済みのリストが既にあります。");
    }

    const addList: ShoppingList = {
      id:
        shoppingLists.reduce((max, current) => {
          if (current.id > max) return current.id;
          else return max;
        }, 0) + 1,
      list_key: list_key,
      order_number: shoppingLists.length + 1,
      name: listData.name,
      memo: listData.memo,
      isShare: true,
      created_user: listData.created_user,
      updated_user: listData.updated_user,
    };

    // ローカルDBに買物リストを追加
    await localdb.shopping_lists.add(addList);

    // サーバーDBから品物を取得
    const { data: itemData, error: error2 } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("list_key", list_key);
    if (error2) throw error2;

    // ローカルDBに品物を追加
    if (itemData && itemData.length > 0) {
      await localdb.shopping_items.bulkAdd(
        itemData.map((item: ShoppingItem) => ({
          list_key: list_key,
          item_key: item.item_key,
          order_number: item.order_number,
          name: item.name,
          category_name: item.category_name ? item.category_name : undefined,
          amount: item.amount ? item.amount : undefined,
          unit: item.unit ? item.unit : undefined,
          priority: item.priority ? item.priority : undefined,
          memo: item.memo ? item.memo : undefined,
          buying_amount: item.buying_amount ? item.buying_amount : undefined,
          buying_unit: item.buying_unit ? item.buying_unit : undefined,
          buying_price: item.buying_price ? item.buying_price : undefined,
          finished_user: item.finished_user ? item.finished_user : undefined,
          finished_at: item.finished_at ? item.finished_at : undefined,
          created_user: item.created_user!,
          updated_user: item.updated_user!,
        }))
      );
    }

    return addList;
  }
};

export default useShoppingItemStore;
