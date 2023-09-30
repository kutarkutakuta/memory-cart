import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  Input,
  InputRef,
  Select,
  SelectProps,
  Space,
  Tag,
  message,
  theme,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useRef, useState } from "react";
import useFavoriteItemStore, {
  FavoriteItem,
} from "@/stores/useFavoriteItemStore";

import styles from "./FavoriteItemMenu.module.scss";

export function FavoriteItemMenu() {
  // メニュー制御用Hook
  const { openFlag, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  // お気に入りの品物用Hook
  const { favoriteItems, addFavoriteItem, removeFavoriteItem } =
    useFavoriteItemStore();

  // 初期化
  useEffect(() => {
    setCategoryName(null);
    setCommonViewCount(25);
  }, [openFlag["FavoriteItemMenu"]]);

  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [commonItemCount, setCommonItemCount] = useState<number>(0);
  const [commonViewCount, setCommonViewCount] = useState<number>(25);
  const [commonViewItems, setCommonViewItems] = useState<CommonItem[]>([]);
  const [viewFavorites, setViewFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    let commons: CommonItem[] = [];
    if (categoryName != null) {
      commons = commonItems.filter((m) => {
        return m.category_name == categoryName;
      });
    }
    setCommonItemCount(commons.length);
    setCommonViewItems(commons.filter((_m, i) => i < commonViewCount));
  }, [categoryName, commonItems, commonViewCount]);

  useEffect(() => {
    let items: FavoriteItem[] = [];
    if (categoryName != null) {
      items = favoriteItems.filter((m) => {
        return m.category_name == categoryName;
      });
    }
    setViewFavorites(items);
  }, [categoryName, favoriteItems]);

  const handleCategoryChange = (value: string) => {
    setCategoryName(value);
    setCommonViewCount(20);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);

  const { token } = theme.useToken();

  /**
   * お気に入りTag入力確定時
   */
  const handleInputConfirm = () => {
    if (inputValue) {
      if (viewFavorites.findIndex((itm) => itm.name == inputValue) === -1) {
        addFavoriteItem(categoryName!, inputValue);
      } else {
        messageApi.warning(`${inputValue}は追加済みです`);
      }
    }
    setInputVisible(false);
    setInputValue("");
  };
  /**
   * お気に入りTag削除時
   * @param removedTag
   */
  const handleClose = (value: FavoriteItem) => {
    removeFavoriteItem(value.id!);
  };

  /**
   * 共通Tag選択時
   * @param value
   */
  const handleTagClick = (value: CommonItem) => {
    if (viewFavorites.findIndex((itm) => itm.name == value.name) === -1) {
      addFavoriteItem(categoryName!, value.name!);
    } else {
      messageApi.warning(`${value.name!}は追加済みです`);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={"お気に入り品の登録"}
        placement={"left"}
        open={openFlag["FavoriteItemMenu"]}
        onClose={() => closeMenu("FavoriteItemMenu")}
      >
        <Select
          showSearch
          allowClear
          maxTagCount={50}
          maxLength={500}
          style={{ width: "100%" }}
          placeholder="カテゴリを選択してください"
          onChange={handleCategoryChange}
          options={categories.map((m) => ({ label: m.name, value: m.name }))}
          value={categoryName}
        />

        {!categoryName ? null : (
          <>
            {/* <Divider orientation="left" plain>
              ☆ 登録中の品物 ☆
            </Divider> */}
            <br />
            <br />
            {inputVisible ? (
              <Input
                ref={inputRef}
                type="text"
                size="small"
                maxLength={20}
                style={{
                  width: "100%",
                  height: 24,
                  marginInlineEnd: 8,
                  verticalAlign: "top",
                }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
              />
            ) : (
              <Tag
                style={{
                  height: 24,
                  background: token.colorBgContainer,
                  borderStyle: "dashed",
                }}
                icon={<PlusOutlined />}
                onClick={() => setInputVisible(true)}
              >
                New Item
              </Tag>
            )}

            <Space size={[0, 8]} wrap>
              {viewFavorites.map((tag, index) => {
                const tagElem = (
                  <Tag
                    key={tag.name}
                    closable={true}
                    style={{ userSelect: "none" }}
                    onClose={() => handleClose(tag)}
                  >
                    {tag.name}
                  </Tag>
                );
                return tagElem;
              })}
            </Space>
          </>
        )}

        {categoryName ? (
          <>
            <Divider style={{ fontSize: "0.9em" }} orientation="left" plain>
              ▽ 一般的な品物から探す ▽
            </Divider>
            <Space size={[0, 8]} wrap>
              {commonViewItems.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleTagClick(m)}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
            {commonItemCount > commonViewCount ? (
              <div style={{ textAlign: "center" }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setCommonViewCount(commonViewCount + 50)}
                  style={{ fontSize: "smaller" }}
                >
                  もっと表示
                </Button>
              </div>
            ) : null}
          </>
        ) : null}

        <Divider></Divider>
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
          Close
        </Button>
      </Drawer>
    </>
  );
}
