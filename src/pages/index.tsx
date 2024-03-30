import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";
import ShoppingListBox from "@/components/ShoppingListBox/ShoppingListBox";
import { ShoppingListMenu } from "@/components/Menu/ShoppingListMenu/ShoppingListMenu";
import useMasterStore from "@/stores/useMasterStore";
import useFavoriteItemStore from "@/stores/useFavoriteItemStore";
import { ShareInfoMenu } from "@/components/Menu/ShareInfoMenu/ShareInfoMenu";
import MyFoorter from "@/components/MyFooter";

const Index = () => {
  // マスター取得
  const { fetchData } = useMasterStore();
  const { fetchFavoriteItems } = useFavoriteItemStore();
  useEffect(() => {
    fetchData();
    fetchFavoriteItems();
  }, []);

  return (
    <>
      <header>
        <MyHeader></MyHeader>
      </header>
      <main>
        <ShoppingListBox></ShoppingListBox>
      </main>
      <footer>
        <MyFoorter></MyFoorter>
      </footer>
      <ShoppingListMenu></ShoppingListMenu>
      <ShareInfoMenu></ShareInfoMenu>
    </>
  );
};

export default Index;
