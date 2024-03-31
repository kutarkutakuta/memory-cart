"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  Image,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from "antd";
import { EditOutlined, HeartTwoTone, SearchOutlined } from "@ant-design/icons";
const { TextArea } = Input;

import useMasterStore from "@/stores/useMasterStore";
import { useEditItemMenu } from "./useEditItemMenu";
import { useEffect, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useFavoriteItemStore, {
  FavoriteItem,
} from "@/stores/useFavoriteItemStore";
import Link from "next/link";
import NextImage from "next/image";

export function EditItemMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedItem, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, units } = useMasterStore();

  // 品物制御用Hook
  const { loading, error, updateShoppingItems } = useShoppingItemStore();

  // お気に入りの品物用Hook
  const { addFavoriteItem, removeFavoriteItem, getFavoriteItem } =
    useFavoriteItemStore();
  const [favoriteItem, setFavoriteItem] = useState<FavoriteItem | null>(null);

  // フォーム用Hook
  const { formData, initialFormData, handleChange } = useEditItemMenu();
  useEffect(() => {
    initialFormData(selectedItem);
    if (selectedItem) {
      getFavoriteItem(selectedItem?.name).then((ret) => {
        setFavoriteItem(ret);
      });
    }
  }, [openFlag["EditItemMenu"]]);

  const handleChangeFavorite = () => {
    if (favoriteItem) {
      removeFavoriteItem(favoriteItem?.id!);
      setFavoriteItem(null);
      messageApi.success("お気に入りから削除しました。");
    } else {
      addFavoriteItem(
        selectedItem?.category_name!,
        selectedItem?.name!
      ).finally(() =>
        getFavoriteItem(selectedItem?.name!).then((ret) => {
          setFavoriteItem(ret);
          messageApi.success("お気に入りに登録しました。");
        })
      );
    }
  };

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (error)
      messageApi.open({
        type: "error",
        content: error?.message,
      });
  }, [error]);

  const getCategoryOption = () => {
    return categories.map((m) => ({ label: m.name, value: m.name }));
  };

  const { Option } = Select;
  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <>
            <EditOutlined />
            <span style={{ paddingLeft: 4 }}>品物の編集</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openFlag["EditItemMenu"]}
        onClose={() => closeMenu("EditItemMenu")}
      >
        <Space direction="vertical" size="small" style={{ display: "flex" }}>
          <Space style={{ width: "100%" }}>
            <Input
              placeholder="品物の名前"
              maxLength={15}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Button
              type={"text"}
              icon={
                <HeartTwoTone twoToneColor={favoriteItem ? "#eb2f96" : ""} />
              }
              onClick={() => handleChangeFavorite()}
            ></Button>
          </Space>

          <Select
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="カテゴリ"
            options={getCategoryOption()}
            value={formData.category_name}
            onChange={(e) => handleChange("category_name", e)}
          />
          <Space.Compact block>
            <InputNumber
              placeholder="数量"
              maxLength={5}
              inputMode="decimal"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e)}
            />

            <Select
              allowClear
              style={{ width: "100px" }}
              options={units.map((m) => ({ label: m.name, value: m.name }))}
              value={formData.unit}
              onChange={(e) => handleChange("unit", e)}
            ></Select>
          </Space.Compact>

          <Select
            allowClear
            placeholder="優先度"
            style={{ width: "100%" }}
            value={formData.priority}
            onChange={(e) => handleChange("priority", e)}
          >
            <Option value="高くても買う">高くても買う</Option>
            <Option value="安かったら買う">安かったら買う</Option>
            <Option value="価格を見て決める">価格を見て決める</Option>
          </Select>

          <TextArea
            rows={3}
            placeholder="メモ"
            maxLength={500}
            value={formData.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          <div style={{fontSize: "small", fontWeight:"lighter", textAlign:"right"}}>
            作成者：{selectedItem?.created_user}　
            更新者：{selectedItem?.updated_user}
          </div>

          <Button
            type="primary"
            loading={loading}
            style={{ width: "100%" }}
            onClick={() => {
              updateShoppingItems([selectedItem?.id!], formData).then(() =>
                closeMenu("EditItemMenu")
              );
            }}
          >
            更新
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => closeMenu("EditItemMenu")}
          >
            キャンセル
          </Button>
        </Space>

        <Divider orientation="left" plain>
          <SearchOutlined />
          ネットスーパーで検索
        </Divider>

        <Space direction="vertical">
          <Link
            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(selectedItem?.name!)}&i=amazonfresh`}
            target="_blank"
          >
            <Image
              alt="Amazon fresh"
              src="assets/stores/amazon-fresh.png"
              preview={false}
              style={{ height: 19 }}
            ></Image>
          </Link>
          <Link
            href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(selectedItem?.name!)}&i=life`}
            target="_blank"
          >
            <Image
              alt="Amazon ライフ"
              src="assets/stores/life.png"
              preview={false}
              style={{ height: 25 }}
            ></Image>
          </Link>
          <Link
            href={`https://sm.rakuten.co.jp/search?keyword=${encodeURIComponent(selectedItem?.name!)}`}
            target="_blank"
          >
            <Image
              alt="楽天西友"
              src="assets/stores/rakuten-seiyu.png"
              preview={false}
              style={{ height: 20 }}
            ></Image>
          </Link>
          <Link
            href={`https://www.iy-net.jp/pc/search/?search-word=${encodeURIComponent(selectedItem?.name!)}`}
            target="_blank"
          >
            <Image
              alt="イトーヨーカドー"
              src="assets/stores/ito-y.png"
              preview={false}
              style={{ height: 17 }}
            ></Image>
          </Link>
          <Link
            href={`https://www.yodobashi.com/category/157851/?word=${encodeURIComponent(selectedItem?.name!)}`}
            target="_blank"
          >
            <Image
              alt="ヨドバシ"
              src="assets/stores/yodobashi.png"
              preview={false}
              style={{ height: 30 }}
            ></Image>
          </Link>
        </Space>
      </Drawer>
    </>
  );
}
