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
  sortShoppingItem: (odlIndex: number, newIndex: number) => void;
  startPolling: (list_key: string) => void;
}

/**
 * 買い物品操作用Hook
 */
const useShoppingItemStore = create<ShoppingItemState>((set) => ({
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
  clearShoppingItems: () => set({ shoppingItems: [] }),
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
  sortShoppingItem: (oldIndex, newIndex) => {
    const state = useShoppingItemStore.getState().shoppingItems;
    const newItems = arrayMove(state, oldIndex, newIndex);

    newItems.forEach((item, i) => {
      item.order_number = i + 1;
      localdb.shopping_items.update(item.id!, item);
    });

    set(() => {
      return { shoppingItems: newItems };
    });
  },
  startPolling: (list_key) =>{
    // DBからデータ取得
    // ローカルDBへ反映
    // ステートに反映
    const poll = async () => {
      
      const { data } = await supabase
      .from("shopping_items")
      .select("list_key")
      .eq("list_key", list_key);

      // TODO

      setTimeout(poll, 5000);
    };
    poll();
  }
}));

export default useShoppingItemStore;
