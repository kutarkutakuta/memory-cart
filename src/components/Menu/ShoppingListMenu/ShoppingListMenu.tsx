"use client";
import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Input, Space, Tooltip, Modal, message } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import {
  FormOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import useShoppingListStore from "@/stores/useShoppingListStore";
import { useShoppingListMenu } from "./useShoppingListMenu";
import { useEffect, useRef } from "react";

export function ShoppingListMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedList, closeMenu } = useMenuStore();
  // 買い物リスト制御用Hook
  const { loading, error, removeShoppingList, updateShoppingList } =
    useShoppingListStore();
  // フォーム制御用Hook
  const { formData, initialFormData, handleChange } = useShoppingListMenu();
  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  // フォーカス制御用Ref
  const inputRef = useRef<any | null>(null);

  useEffect(() => {
    initialFormData(selectedList);
    if(selectedList) inputRef.current?.focus();
  }, [openFlag["ShoppingListMenu"]]);

  useEffect(() => {
    if (error)
      messageApi.open({
        type: "error",
        content: error?.message,
      });
  }, [error]);

  const showDeleteConfirm = () => {
    confirm({
      title: selectedList?.isShare
        ? "共有中のリストを削除しようとしています！"
        : "リストを削除します",
      icon: <ExclamationCircleFilled />,
      content:
        (selectedList?.isShare
          ? "サーバー上の共有データも削除するには共有解除を行ってください。"
          : "削除したリストは元に戻せません。") + "削除しますか？",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      onOk() {
        removeShoppingList(formData.id!);
        closeMenu("ShoppingListMenu");
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <>
            <FormOutlined />
            <span style={{ paddingLeft: 4 }}>リストの編集</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openFlag["ShoppingListMenu"]}
        onClose={() => closeMenu("ShoppingListMenu")}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Input
            ref={inputRef}
            placeholder="リストの名前"
            maxLength={20}
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <TextArea
            rows={4}
            placeholder="メモ"
            maxLength={500}
            value={formData.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          <Button
            type="primary"
            style={{ width: "100%" }}
            loading={loading}
            onClick={() => {
              updateShoppingList(formData.id, formData).then(() => {
                messageApi.success("リストを更新しました。");
                closeMenu("ShoppingListMenu");
              });
            }}
          >
            更新
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => {
              closeMenu("ShoppingListMenu");
            }}
          >
            キャンセル
          </Button>
          
        </Space>
      </Drawer>
    </>
  );
}
