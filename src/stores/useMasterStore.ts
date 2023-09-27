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
  font_size: string;
  notification: boolean;
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
  color: string | null;
  category_name: string | null;
}

interface MasterState {
  appSetting: AppSetting | null;
  categories: Category[];
  units: Unit[];
  commonItems: CommonItem[];
  loading: boolean;
  error: Error | null;
  fetchData: () => Promise<void>;
  updateSetting: (changes: { [keyPath: string]: any }) => void;
}

/**
 * マスタ用Hook
 */
const useMasterStore = create<MasterState>((set) => ({
  appSetting: null,
  categories: [],
  units:[],
  commonItems: [],
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      // app_settings
        const data = await localdb.app_settings.toArray();
      set({ appSetting: data[0] });

      // categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*");
      if (categoriesError) throw categoriesError;
      set({ categories });
      
      // units
      const { data: units, error: unitsError } = await supabase
        .from("units")
        .select("*");
      if (unitsError) throw unitsError;
      set({ units });

      // commonItems
      const { data: commonItems, error: commonItemsError } = await supabase
        .from("common_items")
        .select("*");
      if (commonItemsError) throw commonItemsError;
      set({ commonItems });

      set({ loading: false });
    } catch (error: any) {
      set({ error, loading: false });
    }
  },
  updateSetting: (changes) =>{
    // ローカルDBを更新
    localdb.app_settings.update(1, changes).then((m) => {
      set((state) => {
        return { appSetting: { ...state.appSetting!, ...changes } };
      });
    });
  }
}));

export default useMasterStore;
