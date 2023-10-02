import { create } from "zustand";
import localdb from "@/lib/localdb";
import { ShoppingItem } from "./useShoppingItemStore";
import useMasterStore from "./useMasterStore";

/**
 * 価格履歴
 */
export interface PriceHistory {
  id?: number;
  list_key: string;
  item_key: string;
  name: string;
  category_name: string;
  price: number;
  amount: number | null;
  unit: string | null;
  updated_user: string;
  updated_at: Date;
}

interface PriceHistoryState {
  loading: boolean;
  error: Error | null;
  priceHistories: PriceHistory[];
  fetchPriceHistories: (category_name: string, name: string) => Promise<void>;
  upsertPriceHistory: (
    shoppingItem: ShoppingItem,
    changes: { [keyPath: string]: any }
  ) => Promise<void>;
}

/**
 * 価格履歴操作用Hook
 */
const usePriceHistoryStore = create<PriceHistoryState>((set) => {
  return {
    loading: false,
    error: null,
    priceHistories: [],
    fetchPriceHistories: async (category_name, name) => {
      set({ loading: true, error: null });
      try {
        const priceHistories = await localdb.price_histories
          .where({
            name: name,
            category_name: category_name,
          })
          .toArray();
        set({ priceHistories: priceHistories });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    upsertPriceHistory: async (
      shoppingItem,
      changes
    ) => {
      set({ loading: true, error: null });
      try {
        // マスター用Hook
        const { appSetting } = useMasterStore.getState();

        const keys = {
          list_key: shoppingItem.list_key,
          item_key: shoppingItem.item_key,
          name: shoppingItem.name,
          category_name: shoppingItem.category_name!,
        };

        // ローカルDBのデータを取得
        const priceItem = await localdb.price_histories.where(keys).first();
        if (priceItem) {
          await localdb.price_histories.update(priceItem.id!, {
            price: changes.buying_price,
            amount: changes.buying_amount,
            unit: changes.buying_unit,
            updated_user: appSetting?.user_name,
            updated_at: new Date(),
          });
        } else {
          await localdb.price_histories.add({
            ...keys,
            price: changes.buying_price!,
            amount: changes.buying_amount!,
            unit: changes.buying_unit!,
            updated_user: appSetting?.user_name!,
            updated_at: new Date(),
          });
        }
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
  };
});

export default usePriceHistoryStore;
