"use client"
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


const HomePage = () => {
  const searchParams = useSearchParams();
  const url_key = searchParams.get("key");

  // マスター取得
  const { fetchData } = useMasterStore();
  useEffect(() => {
    fetchData();
  }, []);

  const { getShoppingList } = useShoppingListStore();
  const [shoppingList, setShoppingList] = useState<ShoppingList | undefined>(
    undefined
  );

  useEffect(() => {
    if(url_key) getShoppingList(url_key).then((m) => {
      setShoppingList(m);
    });
  }, [url_key]);

  return (
    <>
      <header>
        <MyHeader title={shoppingList?.name || ""}></MyHeader>
      </header>
      <main>
        <ShoppingBox list_id={shoppingList?.id.toString() || ""} />
      </main>
      <AddItemMenu></AddItemMenu>
      <EditItemMenu></EditItemMenu>
      <PriceMenu></PriceMenu>
    </>
  );
};
export default HomePage;
