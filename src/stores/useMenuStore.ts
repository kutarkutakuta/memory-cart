import { create, useStore } from "zustand";
import { ShoppingItem } from "./useShoppingItemStore";
import { ShoppingList } from "./useShoppingListStore";

interface MenuState {
  openFlag: {[keyPath: string]: boolean};
  selectedList: ShoppingList | null;
  selectedItem: ShoppingItem | null;
  openMenu: (keyPath: string, selectedList?: ShoppingList, selectedItem?: ShoppingItem) => void;
  closeMenu: (keyPath: string) => void;
}

/**
 * メニュー制御用Hook
 */
const useMenuStore = create<MenuState>((set) => ({
  openFlag:{},
  selectedList: null,
  selectedItem: null,
  openMenu: (keyPath: string, selectedList?: ShoppingList, selectedItem?: ShoppingItem) =>{
    document.querySelector("html")!.style.overflow = "hidden";
    set((state)=>{
      state.openFlag[keyPath] = true;
      return { openFlag: state.openFlag, selectedList, selectedItem}
      });
  },
  closeMenu: (keyPath: string)=>{
    document.querySelector("html")!.style.overflow = "";
    set((state)=>{
      state.openFlag[keyPath] = false;
      return { openFlag: state.openFlag, selectedList: null, selectedItem: null}
      });
  },
}));

export default useMenuStore;
