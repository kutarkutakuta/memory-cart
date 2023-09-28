"use client";
import React, { useEffect, useState } from "react";
import { Button, Col, ConfigProvider, Row, ThemeConfig } from "antd";

import style from "./page.module.scss";
import MyHeader from "@/components/MyHeader";
import ShoppingBox from "@/components/ShoppingBox/ShoppingBox";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { AddItemMenu } from "@/components/Menu/AddItemMenu/AddItemMenu";
import { EditItemMenu } from "@/components/Menu/EditItemMenu/EditItemMenu";
import { PriceMenu } from "@/components/Menu/PriceMenu/PriceMenu";
import useMasterStore from "@/stores/useMasterStore";
import { usePathname, useSearchParams } from "next/navigation";
import useShoppingItemStore from "@/stores/useShoppingItemStore";

const HomePage = () => {
  const searchParams = useSearchParams();

  // マスター取得
  const { fetchData } = useMasterStore();
  useEffect(() => {
    const list_key = searchParams.get("key");
    if(list_key) {
      syncShoppingItem(list_key!);
        fetchData();
    }
    return () => {
      // ページを離れる際のクリーンアップ
      clearShoppingItems(); // データを初期化
    };
  }, [searchParams]);

  const {
    shoppingList,
    syncShoppingItem,
    clearShoppingItems,
  } = useShoppingItemStore();

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
