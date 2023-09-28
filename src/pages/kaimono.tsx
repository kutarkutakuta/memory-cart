"use client";
import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";
import ShoppingBox from "@/components/ShoppingBox/ShoppingBox";
import { AddItemMenu } from "@/components/Menu/AddItemMenu/AddItemMenu";
import { EditItemMenu } from "@/components/Menu/EditItemMenu/EditItemMenu";
import { PriceMenu } from "@/components/Menu/PriceMenu/PriceMenu";
import useMasterStore from "@/stores/useMasterStore";
import { useSearchParams } from "next/navigation";
import useShoppingItemStore from "@/stores/useShoppingItemStore";

const HomePage = () => {
  const searchParams = useSearchParams();

  // マスター取得
  const { fetchData } = useMasterStore();
  useEffect(() => {
    const list_key = searchParams.get("key");
    if (list_key) {
      fetchShoppingItems(list_key);
      fetchData();
    }
    return () => {
      // ページを離れる際のクリーンアップ
      clearShoppingItems(); // データを初期化
    };
  }, [searchParams]);

  // 買物リスト操作用Hook
  const { shoppingList, fetchShoppingItems, clearShoppingItems } =
    useShoppingItemStore();

  return (
    <>
      <header>
        <MyHeader
          title={shoppingList?.name || ""}
          isShare={shoppingList?.isShare!}
        ></MyHeader>
      </header>
      <main>
        <ShoppingBox shoppingList={shoppingList!} />
      </main>
      <AddItemMenu></AddItemMenu>
      <EditItemMenu></EditItemMenu>
      <PriceMenu></PriceMenu>
    </>
  );
};
export default HomePage;
