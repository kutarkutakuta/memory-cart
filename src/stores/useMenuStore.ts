import { create, useStore } from "zustand";
import { ShoppingItem } from "./useShoppingItemStore";
import { ShoppingList } from "./useShoppingListStore";

interface MenuState {
  openFlag: {[keyPath: string]: boolean};
  selectedList: ShoppingList | null;
  selectedItem: ShoppingItem | null;
  openMenu: (keyPath: string, selectedList?: ShoppingList, selectedItem?: ShoppingItem) => void;
  closeMenu: (keyPath: string) => void;

  openList: ShoppingList | null;
  openItem: ShoppingItem | null;
  addItemListID: string | null;
  isSetting: boolean;
  isHelp: boolean;
  openShoppingList: (openList: ShoppingList) => void;
  openShoppingItem: (openItem: ShoppingItem) => void;
  openAddItem: (addItemListID: string) => void;
  openSetting: () => void;
  openHelp: () => void;
  closeShoppingList: () => void;
  closeShoppingItem: () => void;
  closeAddItem: () => void;
  closeSetting: () => void;
  closeHelp: () => void;
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
  openList: null,
  openItem: null,
  addItemListID: null,
  isSetting: false,
  isHelp: false,
  openShoppingList: (openList: ShoppingList) => {
    document.querySelector("html")!.style.overflow = "hidden";
    set({ openList: openList });
  },
  openShoppingItem: (openItem: ShoppingItem) => {
    document.querySelector("html")!.style.overflow = "hidden";
    set({ openItem: openItem });
  },
  openAddItem: (addItemListID) => {
    document.querySelector("html")!.style.overflow = "hidden";
    set({ addItemListID: addItemListID });
  },
  openSetting: () => {
    document.querySelector("html")!.style.overflow = "hidden";
    set({ isSetting: true });
  },
  openHelp: () => {
    document.querySelector("html")!.style.overflow = "hidden";
    set({ isHelp: true });
  },
  closeShoppingList: () => {
    document.querySelector("html")!.style.overflow = "";
    set({ openList: null });
  },
  closeShoppingItem: () => {
    document.querySelector("html")!.style.overflow = "";
    set({ openItem: null });
  },
  closeAddItem: () => {
    document.querySelector("html")!.style.overflow = "";
    set({ addItemListID: null });
  },
  closeSetting: () => {
    document.querySelector("html")!.style.overflow = "";
    set({ isSetting: false });
  },
  closeHelp: () => {
    document.querySelector("html")!.style.overflow = "";
    set({ isHelp: false });
  },
}));

export default useMenuStore;
