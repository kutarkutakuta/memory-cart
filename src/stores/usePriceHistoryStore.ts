import { create } from "zustand";
import localdb from "@/lib/localdb";
import { ShoppingItem } from "./useShoppingItemStore";
import useMasterStore from "./useMasterStore";
import supabase from "@/lib/supabase";

/**
 * 価格履歴
 */
export interface PriceHistory {
  id?: number;
  list_key: string;
  item_key: string;
  name: string;
  category_name: string;
  record_date: Date;
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
  globalPriceHistories: PriceHistory[];
  fetchPriceHistories: (category_name: string, name: string) => Promise<void>;
  fetchGlobalPriceHistories: (category_name: string, name: string) => Promise<void>;
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
    globalPriceHistories: [],
    fetchPriceHistories: async (category_name, name) => {
      set({ loading: true, error: null });
      try {
        const priceHistories = await localdb.price_histories
          .where({
            name: name,
            category_name: category_name || "",
          })
          .reverse()
          .sortBy("updated_at")

        set({ priceHistories: priceHistories });
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
    fetchGlobalPriceHistories: async (category_name, name) => {
      set({ loading: true, error: null });
      try {
        const {data, error} = await supabase
            .from("price_histories")
            .select("*")
            .eq("name", name)
            .eq("category_name", category_name || "")
            .order("updated_at", {ascending: false});
          if (error) throw error;

        set({ globalPriceHistories: data as PriceHistory[] });
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
          category_name: shoppingItem.category_name || "",
          record_date : new Date(new Date().toDateString()),
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

        const serverUpserat = async ()=>{
          const {data} = await supabase
              .from("price_histories")
              .select("*")
              .eq("list_key", keys.list_key)
              .eq("item_key", keys.item_key)
              .eq("name", keys.name)
              .eq("category_name", keys.category_name)
              .eq("record_date", keys.record_date.toLocaleDateString())
              .single();
          if(data){
            const { error } = await supabase
            .from("price_histories")
            .update({
              price: changes.buying_price,
              amount: changes.buying_amount,
              unit: changes.buying_unit,
              updated_user: appSetting?.user_name,
              updated_ip_address: appSetting?.ip_address,
            })
            .eq("list_key", keys.list_key)
            .eq("item_key", keys.item_key)
            .eq("name", keys.name)
            .eq("category_name", keys.category_name)
            .eq("record_date", keys.record_date.toLocaleDateString());
            if (error) console.error(error);
          }
          else{
            const { error } = await supabase.from("price_histories").insert({
              list_key: keys.list_key,
              item_key: keys.item_key,
              name: keys.name,
              category_name: keys.category_name || "",
              record_date : keys.record_date.toLocaleDateString(),
              price: changes.buying_price,
              amount: changes.buying_amount,
              unit: changes.buying_unit,
              updated_user: appSetting?.user_name,
              updated_ip_address: appSetting?.ip_address,
            });
            if (error) console.error(error);
          }
        }
        serverUpserat();
          
        set({ loading: false });
      } catch (error: any) {
        set({ error, loading: false });
      }
    },
  };
});

export default usePriceHistoryStore;
