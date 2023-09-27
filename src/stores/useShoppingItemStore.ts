import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";
import useMasterStore from "./useMasterStore";
import {} from "swr";
import { nanoid } from "nanoid";

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
  shoppingItems: ShoppingItem[];
  loading: boolean;
  error: Error | null;
  fetchShoppingItems: (list_key: string) => Promise<void>;
  clearShoppingItems: () => void;
  addShoppingItem: (list_key: string, name: string) => void;
  removeShoppingItem: (id: number) => void;
  updateShoppingItem: (id: number, changes: { [keyPath: string]: any }) => void;
  finishShoppingItem: (id: number) => void;
  sortShoppingItem: (shoppingItems: ShoppingItem[]) => void;
  startPolling: (list_key: string) => void;
}

/**
 * 買い物品操作用Hook
 */
const useShoppingItemStore = create<ShoppingItemState>((set) => {
  let pollTimer: NodeJS.Timeout;

  return {
  shoppingItems: [],
  loading: false,
  error: null,
  fetchShoppingItems: async (list_key) => {
    set({ loading: true, error: null });
    try {
      // ローカルDBから取得
      const data = await localdb.shopping_items
        .orderBy("order_number")
        .filter((m) => m.list_key == list_key)
        .toArray();
      set({ shoppingItems: data });
      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  clearShoppingItems: () => {
    set({ shoppingItems: [] })
  
    // ポーリングも停止！
    clearTimeout(pollTimer);
  }
    ,
  addShoppingItem: (list_key, name) => {
    // マスター用Hook
    const { commonItems } = useMasterStore.getState();

    const { shoppingItems } = useShoppingItemStore.getState();
    const addItem: ShoppingItem = {
      list_key: list_key,
      item_key: nanoid(),
      order_number: shoppingItems.length + 1,
      name: name,
      category_name: commonItems.find((m) => m.name == name)?.category_name!,
      created_at: new Date(),
    };

    // ローカルDBへ追加
    localdb.shopping_items.add(addItem).then((id) => {
      addItem.id = id;
      // ステート更新
      set((state) => ({
        shoppingItems: [...state.shoppingItems, addItem],
      }));
    });
  },
  removeShoppingItem: (id) => {
    // ローカルDBから削除
    localdb.shopping_items.delete(id).then(() => {
      // ステート更新
      set((state) => {
        const m = state.shoppingItems.filter((n) => n.id !== id);
        return { shoppingItems: m };
      });
    });
  },
  updateShoppingItem: (id, changes) => {
    // ローカルDBを更新
    localdb.shopping_items.update(id, changes).then((m) => {
      set((state) => {
        const m = state.shoppingItems.map((n) => {
          return n.id === id ? { ...n, ...changes } : n;
        });
        return { shoppingItems: m };
      });
    });
  },
  finishShoppingItem: (id) => {
    const changes = { finished_at: new Date() };

    // ローカルDBを更新
    localdb.shopping_items.update(id, { finished_at: new Date() }).then((m) => {
      set((state) => {
        const m = state.shoppingItems.map((n) => {
          return n.id === id ? { ...n, ...changes } : n;
        });
        return { shoppingItems: m };
      });
    });
  },
  sortShoppingItem: (shoppingItems) => {

    shoppingItems.forEach((item, i) => {
      item.order_number = i + 1;
      localdb.shopping_items.update(item.id!, item);
    });

    set({ shoppingItems });
  },
  startPolling: (list_key) => {
   
    const poll = async () => {
      // DBからデータ取得
      const { data } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_key", list_key);

      const { shoppingItems, fetchShoppingItems } = useShoppingItemStore.getState();

       // ローカルDBへ反映
      if (data) {
        // DBがあれば同期　存在しない場合は同期しない
        for(const serverData of data){
          const localData = shoppingItems.find(
            (itm) =>
              itm.list_key == serverData.list_key &&
              itm.item_key == serverData.item_key
          );
          if (localData) {
            // 差分があれば更新
            const changes: any = {};
            if (serverData["name"] !== localData.name)
              changes["name"] = serverData["name"];
            if (serverData["category_name"] !== localData.category_name)
              changes["category_name"] = serverData["category_name"];
            if (serverData["amount"] !== localData.amount)
              changes["amount"] = serverData["amount"];
            if (serverData["unit"] !== localData.unit)
              changes["unit"] = serverData["unit"];
            if (serverData["priority"] !== localData.priority)
              changes["priority"] = serverData["priority"];
            if (serverData["memo"] !== localData.memo)
              changes["memo"] = serverData["memo"];
            if (serverData["buying_amount"] !== localData.buying_amount)
              changes["buying_amount"] = serverData["buying_amount"];
            if (serverData["buying_unit"] !== localData.buying_unit)
              changes["buying_unit"] = serverData["buying_unit"];
            if (serverData["buying_price"] !== localData.buying_price)
              changes["buying_price"] = serverData["buying_price"];
            if (serverData["finished_user"] !== localData.finished_user)
              changes["finished_user"] = serverData["finished_user"];
            if (serverData["finished_at"] !== localData.finished_at)
              changes["finished_at"] = serverData["finished_at"];

              if(Object.keys(changes).length > 0){
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

        const deleteItems = shoppingItems.filter(
          (itm) => data.findIndex((d) => d.item_key == itm.item_key) == -1
        );
        if(deleteItems.length > 0){
          await localdb.shopping_items.bulkDelete(deleteItems.map(itm=>itm.id!));
        }
       
      }

      // フェッチしなおし
      fetchShoppingItems(list_key);

      pollTimer = setTimeout(poll, 5000);
    };
    poll();
  },
}});

export default useShoppingItemStore;
