"use client";
import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Select, SelectProps, Space, Tag, message } from "antd";

import styles from "./AddItemMenu.module.scss";
import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";

export function AddItemMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedList, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  // 初期化
  useEffect(() => {
    if (selectedList) {
      setListKey(selectedList.list_key);
      setAddItems([]);
      setCategoryName(null);
      setViewCount(25);
    }
  }, [openFlag["AddItemMenu"]]);

  const [list_key, setListKey] = useState<string | null>(null);
  const [addItems, setAddItems] = useState<string[]>([]);
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
      <Drawer
        title={
          <>
            <span style={{ paddingLeft: 4 }}>
              {" "}
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="品物の名前(複数可)"
                value={addItems}
                suffixIcon={null}
                notFoundContent={null}
                onSearch={handleItemSearch}
                options={(itemOptions || []).map((d) => ({
                  value: d.value,
                  label: d.text,
                }))}
                onChange={handleItemChange}
              />
            </span>
          </>
        }
        placement={"right"}
        open={openFlag["AddItemMenu"]}
        onClose={() => closeMenu("AddItemMenu")}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <div>☆よく買う物から探す☆</div>
          <Select
            showSearch
            allowClear
            maxTagCount={50}
            maxLength={500}
            style={{ width: "100%" }}
            placeholder="カテゴリで絞り込み"
            onChange={handleCategoryChange}
            options={getCategoryOption()}
            value={categoryName}
          />
          <Space size={[0, 8]} wrap>
            {contextHolder}
            {viewItems.map((m) => (
              <Tag
                key={m.id}
                style={{ cursor: "pointer" }}
                onClick={() => handleTagClick(m.name!)}
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

          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={(e) => {
              addItems.forEach((name) => {
                addShoppingItem(list_key!, name);
              });
              closeMenu("AddItemMenu");
            }}
          >
            追加
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => closeMenu("AddItemMenu")}
          >
            キャンセル
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
