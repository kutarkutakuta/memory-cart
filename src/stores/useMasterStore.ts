import { create } from "zustand";
import supabase from "@/lib/supabase";
import localdb from "@/lib/localdb";

/**
 * 設定
 */
export interface AppSetting {
  id: number;
  user_name: string;
  theme: string;
  font_size: number;
  notification: boolean;
  ip_address: string;
}

/**
 * カテゴリ
 */
export interface Category {
  id: number;
  order_number: number;
  name: string | null;
  bgcolor: string | null;
  color: string | null;
}

/**
 * 単位
 */
export interface Unit {
  id: number;
  order_number: number;
  name: string | null;
}

/**
 * 一般品
 */
export interface CommonItem {
  id: number;
  order_number: number;
  name: string | null;
  category_name: string | null;
}

interface MasterState {
  loading: boolean;
  error: Error | null;
  appSetting: AppSetting | null;
  categories: Category[];
  units: Unit[];
  commonItems: CommonItem[];
  fetchData: () => Promise<void>;
  updateSetting: (changes: { [keyPath: string]: any }) => void;
}

/**
 * マスタ用Hook
 */
const useMasterStore = create<MasterState>((set) => ({
  loading: false,
  error: null,
  appSetting: null,
  categories: [],
  units: [],
  commonItems: [],
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      // app_settings
      let app_setting = await localdb.app_settings.get(1);
      if (!app_setting) {
        // 初期データ
        app_setting = {
          id: 1,
          user_name: "Guest",
          theme: "dark",
          font_size: 16,
          notification: false,
          ip_address: "",
        };
        await localdb.app_settings.add(app_setting);
      }
      // IPアドレスをセット
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        app_setting.ip_address = data.ip;
      } catch (error) {
        // 何もしない
        console.warn("ネットワークに接続されていません", error);
      }
      set({ appSetting: app_setting });

      // categories
      let categories = await localdb.categories
        .orderBy("order_number")
        .toArray();
      // サーバーDBに接続できたら更新
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("order_number");
      if (categoriesError) {
        console.error(categoriesError);
      } else {
        if (categoriesData && categoriesData.length > 0) {
          categories = categoriesData as Category[];
          await localdb.units.clear();
          await localdb.units.bulkAdd(categories);
        }
      }
      set({ categories });

      // units
      let units = await localdb.units.orderBy("order_number").toArray();
      // サーバーDBに接続できたら更新
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .order("order_number");
      if (unitsError) {
        console.error(unitsError);
      } else {
        if (unitsData && unitsData.length > 0) {
          units = unitsData as Unit[];
          await localdb.units.clear();
          await localdb.units.bulkAdd(units);
        }
      }
      set({ units });

      // commonItems
      let common_items = await localdb.common_items
        .orderBy("order_number")
        .toArray();
      // サーバーDBに接続できたら更新
      const { data: commonItemsData, error: commonItemsError } = await supabase
        .from("common_items")
        .select("*")
        .order("order_number");
      if (commonItemsError) {
        console.error(commonItemsError);
      } else {
        if (commonItemsData && commonItemsData.length > 0) {
          common_items = commonItemsData as CommonItem[];
          await localdb.units.clear();
          await localdb.units.bulkAdd(common_items);
        }
      }
      set({ commonItems: common_items });

      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  updateSetting: (changes) => {
    // ローカルDBを更新
    localdb.app_settings.update(1, changes).then((m) => {
      set((state) => {
        return { appSetting: { ...state.appSetting!, ...changes } };
      });
    });
  },
}));

export default useMasterStore;
