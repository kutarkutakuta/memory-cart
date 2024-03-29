import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  Input,
  Select,
  Space,
  Tag,
  message,
  theme,
} from "antd";
import { PlusOutlined, HeartOutlined } from "@ant-design/icons";

import { useEffect, useRef, useState } from "react";
import useFavoriteItemStore, {
  FavoriteItem,
} from "@/stores/useFavoriteItemStore";

import useMasterStore, { CommonItem } from "@/stores/useMasterStore";

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
    setViewCommonCount(25);
  }, [openFlag["FavoriteItemMenu"]]);

  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [commonItemCount, setCommonItemCount] = useState<number>(0);
  const [viewCommonCount, setViewCommonCount] = useState<number>(25);
  const [viewCommons, setviewCommons] = useState<CommonItem[]>([]);
  const [viewFavorites, setViewFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    let commons: CommonItem[] = [];
    if (categoryName != null) {
      commons = commonItems.filter((m) => {
        return m.category_name == categoryName;
      });
    }
    setCommonItemCount(commons.length);
    setviewCommons(commons.filter((_m, i) => i < viewCommonCount));
  }, [categoryName, commonItems, viewCommonCount]);

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
    setViewCommonCount(20);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { token } = theme.useToken();

  /**
   * お気に入りTag入力確定時
   */
  const handleInputConfirm = () => {
    if (inputValue) {
      const itm = favoriteItems.find((itm) => itm.name == inputValue);
      if (itm) {
        messageApi.warning(
          `${inputValue}は「${itm.category_name}」に追加済みです`
        );
      } else {
        addFavoriteItem(categoryName!, inputValue);
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
    const itm = favoriteItems.find((itm) => itm.name == value.name);
    if (itm) {
      messageApi.warning(
        `${value.name}は「${itm.category_name}」に追加済みです`
      );
    } else {
      addFavoriteItem(categoryName!, value.name!);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <>
            <HeartOutlined />
            <span style={{ paddingLeft: 4 }}>お気に入り品の登録</span>
          </>
        }
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
            <Divider style={{ fontSize: "0.9em" }} orientation="left" plain>
              お気に入り品
            </Divider>

            <Space size={[0, 8]} wrap>
              {inputVisible ? (
                <Input
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
              一般的な品物
            </Divider>
            <Space size={[0, 8]} wrap>
              {viewCommons.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleTagClick(m)}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
            {commonItemCount > viewCommonCount ? (
              <div style={{ textAlign: "center" }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setViewCommonCount(viewCommonCount + 50)}
                  
                >
                  <span style={{ fontSize: "small" }}>もっと表示</span>
                </Button>
              </div>
            ) : null}
          </>
        ) : null}

        <Divider></Divider>

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
