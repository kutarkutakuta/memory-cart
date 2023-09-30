import { FavoriteItem } from "@/stores/useFavoriteItemStore";
import { AppSetting, Category, CommonItem, Unit } from "@/stores/useMasterStore";
import { ShoppingItem } from "@/stores/useShoppingItemStore";
import { ShoppingList } from "@/stores/useShoppingListStore";
import Dexie from "dexie";

// Dexieデータベースを定義
class OkaimonoDatabase extends Dexie {
  app_settings: Dexie.Table<AppSetting, number>;
  categories: Dexie.Table<Category, number>;
  units: Dexie.Table<Unit, number>;
  common_items: Dexie.Table<CommonItem, number>;
  favorite_items: Dexie.Table<FavoriteItem, number>;
  shopping_lists: Dexie.Table<ShoppingList, number>;
  shopping_items: Dexie.Table<ShoppingItem, number>;

  constructor() {
    super("OkaimonoDatabase");
    this.version(1).stores({
      app_settings: "id",
      categories: "++id, order_number, name",
      units: "++id, order_number, name",
      favorite_items: "++id, category, order_number, name",
      common_items: "++id, category, order_number, name",
      shopping_lists: "id, list_key, order_number, name",
      shopping_items: "++id, list_key, item_key, order_number, name",
    });
    this.app_settings = this.table("app_settings");
    this.categories = this.table("categories");
    this.units = this.table("units");
    this.common_items = this.table("common_items");
    this.favorite_items = this.table("favorite_items");
    this.shopping_lists = this.table("shopping_lists");
    this.shopping_items = this.table("shopping_items");

    // // 初期データの挿入
    // this.on("populate", () => {
    //   const app_setting: AppSetting = {
    //     id: 1,
    //     user_name: "Guest",
    //     theme: "dark",
    //     font_size: "16",
    //     notification: false,
    //   };
    //   this.app_settings.add(app_setting);
    // });
  }
}

const localdb = new OkaimonoDatabase();
export default localdb;
