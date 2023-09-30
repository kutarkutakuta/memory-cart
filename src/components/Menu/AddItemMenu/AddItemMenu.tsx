"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  Radio,
  Select,
  SelectProps,
  Space,
  Tag,
  message,
} from "antd";

import styles from "./AddItemMenu.module.scss";
import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useFavoriteItemStore, { FavoriteItem } from "@/stores/useFavoriteItemStore";

export function AddItemMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedList, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  // お気に入り品用Hook
  const { favoriteItems } = useFavoriteItemStore();

  // 初期化
  useEffect(() => {
    if (selectedList) {
      setListKey(selectedList.list_key);
      setAddItems([]);
      setCategoryName(null);
      setViewItemCount(25);
    }
  }, [openFlag["AddItemMenu"]]);

  const [list_key, setListKey] = useState<string | null>(null);
  const [addItems, setAddItems] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  const [viewItemCount, setViewItemCount] = useState<number>(25);
  const [viewCommons, setViewCommons] = useState<CommonItem[]>(commonItems);
  const [viewFavorites, setViewFavorites] = useState<FavoriteItem[]>([]);
  const [searchMode, setSearchMode] = useState(1);

  useEffect(() => {

    if(searchMode === 1){
      let items: FavoriteItem[] = favoriteItems;
      if (categoryName != null) {
        items = favoriteItems.filter((m) => {
          return m.category_name == categoryName;
        });
      }
      setItemCount(items.length);
      setViewFavorites(items.filter((_m, i) => i < viewItemCount));
    }
    else{
      let newItems = commonItems;
      if (categoryName != null) {
        newItems = commonItems.filter((m) => {
          return m.category_name == categoryName;
        });
      }
      setItemCount(newItems.length);
      setViewCommons(newItems.filter((_m, i) => i < viewItemCount));
    }
    
  }, [commonItems, favoriteItems, searchMode, categoryName, viewItemCount]);

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

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();

  const { shoppingItems, addShoppingItem } = useShoppingItemStore();

  const [itemOptions, setItemOptions] = useState<SelectProps["options"]>([]);
  
  const handleItemSearch = (newValue: string) => {

    if(newValue.length > 0){
      const a = commonItems
      .filter((itm) => itm.name?.startsWith(newValue))
      .map((itm) => ({
        value: itm.name!,
        label: itm.name!,
      }));
      const b = favoriteItems
      .filter((itm) => itm.name?.startsWith(newValue))
      .map((itm) => ({
        value: itm.name,
        label: itm.name,
      }));
      ;
      setItemOptions(a.concat(b));
    }
    else{
      setItemOptions([]);
    }
  };


  return (
    <>
      {contextHolder}
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
                onChange={(e)=>setAddItems(e)}
              />
            </span>
          </>
        }
        placement={"right"}
        open={openFlag["AddItemMenu"]}
        onClose={() => closeMenu("AddItemMenu")}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>

          <Select
            style={{ width: "100%" }}
            onChange={(e) => {
              setViewItemCount(20);
              setSearchMode(e);
            }}
            options={[{ value: 1, label: "お気に入りから探す" },{ value: 2, label: "一般品から探す" }]}
            value={searchMode}
          />

          <Select
            showSearch
            allowClear
            maxTagCount={50}
            maxLength={500}
            style={{ width: "100%" }}
            placeholder="カテゴリで絞り込み"
            onChange={(e) =>{
              setViewItemCount(20);
              setCategoryName(e);
            }}
            options={categories.map((m) => ({ label: m.name, value: m.name }))}
            value={categoryName}
          />
          {searchMode === 1 ? (
            <Space size={[0, 8]} wrap>
              
            {viewFavorites.length == 0 ? "お気に入りが登録されていません": ""}
              {viewFavorites.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleTagClick(m.name!)}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
          ) : (
            <Space size={[0, 8]} wrap>
            {viewCommons.length == 0 ? "一般品が見つかりません": ""}
              {viewCommons.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleTagClick(m.name!)}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
          )}

          {itemCount > viewItemCount ? (
            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                size="small"
                onClick={() => setViewItemCount(viewItemCount + 50)}
                style={{ fontSize: "smaller" }}
              >
                もっと表示
              </Button>
            </div>
          ) : null}
<Divider style={{margin:0}}></Divider>
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
