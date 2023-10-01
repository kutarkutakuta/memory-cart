import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";
import ShoppingListBox from "@/components/ShoppingListBox/ShoppingListBox";
import { ShoppingListMenu } from "@/components/Menu/ShoppingListMenu/ShoppingListMenu";
import useMasterStore from "@/stores/useMasterStore";
import useFavoriteItemStore from "@/stores/useFavoriteItemStore";
import { ShareInfoMenu } from "@/components/Menu/ShareInfoMenu/ShareInfoMenu";

const HomePage = () => {
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
      <ShoppingListMenu></ShoppingListMenu>
      <ShareInfoMenu></ShareInfoMenu>
    </>
  );
};

export default HomePage;
