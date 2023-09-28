import supabase from "@/lib/supabase";
import { create } from "zustand";
import useShoppingListStore, { ShoppingList } from "./useShoppingListStore";
import { PostgrestError } from "@supabase/supabase-js";
import useShoppingItemStore, { ShoppingItem } from "./useShoppingItemStore";
import localdb from "@/lib/localdb";

interface ShareState {
  // TODO:エラー処理どうしよう・・・？　zustandである必要がないような？
  unShareList: (list_key: string) => Promise<PostgrestError | null>;
  addFromShareKey: (list_key: string) => Promise<PostgrestError | null>;
}

const useShareStore = create<ShareState>((set) => ({

  unShareList: async (list_key) => {
    const { error: error1 } = await supabase
      .from("shopping_items")
      .delete()
      .eq("list_key", list_key);
    if (error1) {
      console.error(error1);
      return error1;
    }
    const { error: error2 } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("list_key", list_key);
    if (error2) {
      console.error(error2);
      return error2;
    }
    return null;
  },
  addFromShareKey: async (list_key) => {
    const { data: listData } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("list_key", list_key)
      .single();
    if (listData) {
      // ローカルDBに追加
      // ローカルDBから取得
      const shopping_lists = await localdb.shopping_lists
        .orderBy("order_number")
        .toArray();
      if(shopping_lists.findIndex(m=>m.list_key == list_key) > -1){
        throw "共有済みのリストが存在しています。";
      }
      
      await localdb.shopping_lists.add({
        id:
        shopping_lists.reduce((max, current) => {
            if (current.id > max) return current.id;
            else return max;
          }, 0) + 1,
        list_key: list_key,
        order_number: shopping_lists.length + 1,
        name: listData.name,
        memo: listData.memo,
        isShare: true,
        created_user: listData.created_user,
        created_at: listData.created_at,
      });

      const { data: itemData } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_key", list_key);

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
            created_user: item.created_user ? item.created_user : undefined,
            created_at: item.created_at ? item.created_at : undefined,
            finished_user: item.finished_user ? item.finished_user : undefined,
            finished_at: item.finished_at ? item.finished_at :undefined,
          }))
        );
      }
      else{
        throw "共有キーが無効です。";
      }
    }
    return null;
  },
}));

export default useShareStore;
