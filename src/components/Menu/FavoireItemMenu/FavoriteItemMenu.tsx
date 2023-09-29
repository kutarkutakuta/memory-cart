"use client";
import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Select, SelectProps, Space, Tag, message } from "antd";

import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useRef, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useFavoriteItemStore from "@/stores/useFavoriteItemStore";

export function FavoriteItemMenu() {
  // メニュー制御用Hook
  const { openFlag, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  // お気に入りの品物用Hook
  const {
    favoriteItems,
    fetchFavoriteItems,
    addFavoriteItem,
    removeFavoriteItem,
  } = useFavoriteItemStore();

  // 初期化
  useEffect(() => {
    setCategoryName(null);
    setViewCount(25);
  }, [openFlag["FavoriteItemMenu"]]);

  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  const [viewCount, setViewCount] = useState<number>(25);
  const [viewItems, setViewItems] = useState<CommonItem[]>(commonItems);

  useEffect(() => {
    let newItems = commonItems;
    if (categoryName != null) {
      newItems = commonItems.filter((m) => {
        return m.category_name == categoryName;
      });
    }
    setItemCount(newItems.length);
    setViewItems(newItems.filter((_m, i) => i < viewCount));
  }, [commonItems, categoryName, viewCount]);

  function usePrevious(value: any) {
    const ref = useRef(null);
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
  
  const getCategoryOption = () => {
    return categories.map((m) => ({ label: m.name, value: m.name }));
  };

  const handleCategoryChange = (value: string) => {
    setCategoryName(value);
    setViewCount(20);
  };



  const [messageApi, contextHolder] = message.useMessage();


  const [itemOptions, setItemOptions] = useState<SelectProps["options"]>([]);
  const handleItemSearch = (newValue: string) => {
    const newOptions =
      newValue.length > 0
        ? commonItems
            .filter((itm) => itm.name?.startsWith(newValue))
            .map((itm) => ({
              value: itm.name,
              label: itm.name,
            }))
        : [];
    setItemOptions(newOptions);
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={"お気に入りの品物登録"}
        placement={"left"}
        open={openFlag["FavoriteItemMenu"]}
        onClose={() => closeMenu("FavoriteItemMenu")}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Select
            showSearch
            allowClear
            maxTagCount={50}
            maxLength={500}
            style={{ width: "100%" }}
            placeholder="カテゴリ"
            onChange={handleCategoryChange}
            options={getCategoryOption()}
            value={categoryName}
          />

          <div>☆お気に入りの品物☆</div>
          <Space size={[0, 8]} wrap>
            {viewItems.map((m) => (
              <Tag
                key={m.id}
                style={{ cursor: "pointer" }}
              >
                {m.name}
              </Tag>
            ))}
          </Space>

          <div>☆一般的な品物から探す☆</div>

          <Space size={[0, 8]} wrap>
            {contextHolder}
            {favoriteItems.filter(itm=>itm.category_name == categoryName).map((m) => (
              <Tag
                key={m.id}
                style={{ cursor: "pointer" }}
              >
                {m.name}
              </Tag>
            ))}
          </Space>

          {itemCount > viewCount ? (
            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                size="small"
                onClick={() => setViewCount(viewCount + 50)}
                style={{ fontSize: "smaller" }}
              >
                もっと表示
              </Button>
            </div>
          ) : null}

          {/* <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={(e) => {
              addItems.forEach((name) => {
                addShoppingItem(list_key!, name);
              });
            }}
          >
            登録
          </Button> */}

          <Button
            style={{ width: "100%" }}
            onClick={() => closeMenu("FavoriteItemMenu")}
          >
            キャンセル
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
