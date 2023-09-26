import supabase from "@/lib/supabase";
import { create } from "zustand";
import useShoppingListStore, { ShoppingList } from "./useShoppingListStore";
import { PostgrestError } from "@supabase/supabase-js";
import useShoppingItemStore, { ShoppingItem } from "./useShoppingItemStore";
import localdb from "@/lib/localdb";

interface ShareState {
  // TODO:エラー処理どうしよう・・・？　zustandである必要がないような？
  shareList: (list: ShoppingList) => Promise<PostgrestError | null>;
  unShareList: (url_key: string) => Promise<PostgrestError | null>;
  addFromShareKey: (url_key: string) => Promise<PostgrestError | null>;
}

const useShareStore = create<ShareState>((set) => ({
  shareList: async (list) => {
    // 共有時はDBも更新
    const { data } = await supabase
      .from("shopping_lists")
      .select("url_key")
      .eq("url_key", list.url_key);
    if (data && data.length > 0) {
      // 共有済みなのでリストのデータを更新するだけ
      const { error } = await supabase
        .from("shopping_lists")
        .update({
          url_key: list.url_key,
          name: list.name,
          memo: list.memo,
        })
        .eq("url_key", list.url_key);
      if (error) {
        console.error(error);
        return error;
      }
    } else {
      // 新規に共有データを作成
      const { error: error1 } = await supabase.from("shopping_lists").insert({
        url_key: list.url_key,
        name: list.name,
        memo: list.memo,
        created_user: "GUEST",
      });
      if (error1) {
        console.error(error1);
        return error1;
      }
      // 買物品もDBへ追加する
      // ローカルDBから取得
      const data = await localdb.shopping_items
        .where({ shopping_list_id: list.id.toString() })
        .toArray();
      const { error: error2 } = await supabase.from("shopping_items").insert(
        data.map((d) => ({
          url_key: list.url_key,
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
      if (error2) {
        console.error(error2);
        return error2;
      }
    }
    return null;
  },
  unShareList: async (url_key) => {
    const { error: error1 } = await supabase
      .from("shopping_items")
      .delete()
      .eq("url_key", url_key);
    if (error1) {
      console.error(error1);
      return error1;
    }
    const { error: error2 } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("url_key", url_key);
    if (error2) {
      console.error(error2);
      return error2;
    }
    return null;
  },
  addFromShareKey: async (url_key) => {
    const { data: listData } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("url_key", url_key)
      .single();
    if (listData) {
      // ローカルDBに追加
      const { shoppingLists } = useShoppingListStore.getState();
      const new_list_id = await localdb.shopping_lists.add({
        id:
          shoppingLists.reduce((max, current) => {
            if (current.id > max) return current.id;
            else return max;
          }, 0) + 1,
        url_key: url_key,
        order_number: shoppingLists.length + 1,
        name: listData.name,
        memo: listData.memo,
        isShare: true,
        created_user: listData.created_user,
        created_at: listData.created_at,
      });

      const { data: itemData } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("url_key", url_key);

      if (itemData && itemData.length > 0) {
        await localdb.shopping_items.bulkAdd(
          itemData.map((item: ShoppingItem) => ({
            shopping_list_id: new_list_id.toString(),
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
