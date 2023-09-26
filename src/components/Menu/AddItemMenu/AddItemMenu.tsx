"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Drawer,
  Select,
  Space,
  Tag,
  message,
} from "antd";

import styles from "./AddItemMenu.module.scss";
import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";

export function AddItemMenu() {
  // メニュー制御用Hook
  const { addItemListID, closeAddItem } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  // 初期化
  useEffect(() => {
    if (addItemListID != null) {
      setItemListID(addItemListID);
      setAddItems([]);
      setCategoryName(null);
      setViewCount(25);
    }
  }, [addItemListID]);

  const [itemListID, setItemListID] = useState<string | null>(null);
  const [addItems, setAddItems] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(25);
  const [viewItems, setViewItems] = useState<CommonItem[]>(commonItems);

  useEffect(() => {
    let newItems = commonItems;
    if (categoryName != null) {
      newItems = commonItems.filter((m) => {
        return m.category_name == categoryName;
      });
    }
    setViewItems(newItems.filter((m, i) => i < viewCount));
  }, [commonItems, categoryName, viewCount]);

  const getItemOption = () => {
    return commonItems.map((m) => ({ label: m.name, value: m.name }));
  };

  const getCategoryOption = () => {
    return categories.map((m) => ({ label: m.name, value: m.name }));
  };

  const handleCategoryChange = (value: string) => {
    setCategoryName(value);
    setViewCount(20);
  };

  const handleItemChange = (value: Array<string>) => {
    setAddItems(value);
  };

  const handleTagClick = (value: string) => {
    if (
      addItems.findIndex((m) => m == value) < 0 &&
      shoppingItems.findIndex((m) => m.name == value) < 0
    ) {
      const newItems = [...addItems, value];
      setAddItems(newItems);
    } else {
      messageApi.warning(`${value}は追加済みです`);
    }
  };

  const [messageApi, contextHolder] = message.useMessage();

  const { shoppingItems, addShoppingItem } = useShoppingItemStore();

  return (
    <>
      <Drawer
        title={
          <>
            <span style={{ paddingLeft: 4 }}>
              {" "}
              <Select
                mode="tags"
                suffixIcon={null}
                allowClear
                style={{ width: "100%" }}
                placeholder="品物の名前(複数可)"
                value={addItems}
                options={getItemOption()}
                onChange={(e) => handleItemChange(e)}
              />
            </span>
          </>
        }
        placement={"right"}
        open={addItemListID != null}
        onClose={closeAddItem}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <div>☆よく買う物から探す☆</div>
          <Select
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="カテゴリで絞り込み"
            onChange={handleCategoryChange}
            options={getCategoryOption()}
          />
          <Space size={[0, 8]} wrap>
            {contextHolder}
            {viewItems.map((m) => (
              <Tag
                key={m.id}
                style={{ cursor: "pointer" }}
                onClick={(e) => handleTagClick(m.name!)}
              >
                {m.name}
              </Tag>
            ))}
          </Space>
          <Button
            type="link"
            onClick={() => setViewCount(viewCount + 50)}
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            もっと表示
          </Button>

          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={(e) => {
              addItems.forEach((name) => {
                addShoppingItem(itemListID!, name);
              });
              closeAddItem();
            }}
          >
            追加
          </Button>

          <Button style={{ width: "100%" }} onClick={closeAddItem}>
            キャンセル
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
