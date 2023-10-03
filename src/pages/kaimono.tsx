import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MyHeader from "@/components/MyHeader";
import ShoppingCardBox from "@/components/ShoppingCardBox/ShoppingCardBox";
import { AddItemMenu } from "@/components/Menu/AddItemMenu/AddItemMenu";
import { EditItemMenu } from "@/components/Menu/EditItemMenu/EditItemMenu";
import { PriceMenu } from "@/components/Menu/PriceMenu/PriceMenu";
import useMasterStore from "@/stores/useMasterStore";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import { Spin, message } from "antd";
import useFavoriteItemStore from "@/stores/useFavoriteItemStore";
import { ShareInfoMenu } from "@/components/Menu/ShareInfoMenu/ShareInfoMenu";

const Kaimono = () => {
  const searchParams = useSearchParams();

  // マスター取得
  const { fetchData } = useMasterStore();
  const { fetchFavoriteItems } = useFavoriteItemStore();
  useEffect(() => {
    const list_key = searchParams.get("key");
    if (list_key) {
      fetchShoppingItems(list_key);
      fetchData();
      fetchFavoriteItems();
    }
    return () => {
      // ページを離れる際のクリーンアップ
      clearShoppingItems(); // データを初期化
    };
  }, [searchParams]);

  // 買物リスト操作用Hook
  const { info, error, shoppingList, fetchShoppingItems, clearShoppingItems } =
    useShoppingItemStore();

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (error) messageApi.error(error?.message);
  }, [error]);
  useEffect(() => {
    if (info) messageApi.info(info);
  }, [info]);

  return (
    <>
      {contextHolder}
      <header>
        <MyHeader></MyHeader>
      </header>

      <main>
        <ShoppingCardBox shoppingList={shoppingList!} />
      </main>
      <AddItemMenu></AddItemMenu>
      <EditItemMenu></EditItemMenu>
      <PriceMenu></PriceMenu>
      <ShareInfoMenu></ShareInfoMenu>
    </>
  );
};
export default Kaimono;
