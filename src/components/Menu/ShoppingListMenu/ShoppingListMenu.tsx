"use client";
import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Input, Space, Tooltip, Modal, message } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import {
  ShoppingCartOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import useShoppingListStore from "@/stores/useShoppingListStore";
import { useShoppingListMenu } from "./useShoppingListMenu";
import { useEffect } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LineIcon,
  LineShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";

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

  useEffect(() => {
    initialFormData(selectedList);
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
          : "削除したリストは元に戻せません！") + "削除してよろしいですか？",
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
            <ShoppingCartOutlined />
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
          {selectedList?.isShare ? (
            <>
              <Tooltip title="共有したい相手にURLを送ります。">
                ☆リストの共有☆
              </Tooltip>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={
                    "https://memory-cart.onrender.com/kaimono?key=" +
                    selectedList?.list_key
                  }
                  readOnly
                  bordered={false}
                  style={{ color: "#000", backgroundColor: "#323232" }}
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "https://memory-cart.onrender.com/kaimono?key=" +
                        selectedList?.list_key
                    );
                    messageApi.info(
                      "クリップボードにURLをコピーしました。"
                    );
                  }}
                >
                  <CopyOutlined />
                </Button>
              </Space.Compact>
              <Space.Compact style={{ width: "100%" }}>
                <EmailShareButton
                  url={
                    "https://memory-cart.onrender.com/kaimono?key=" +
                    selectedList?.list_key
                  }
                  title={"共有します"}
                >
                  <EmailIcon size={24} round />
                </EmailShareButton>
                <FacebookShareButton
                  url={
                    "https://memory-cart.onrender.com/kaimono?key=" +
                    selectedList?.list_key
                  }
                  quote={"共有します"}
                >
                  <FacebookIcon size={24} round />
                </FacebookShareButton>
                <TwitterShareButton
                  url={
                    "https://memory-cart.onrender.com/kaimono?key=" +
                    selectedList?.list_key
                  }
                  title={"共有します"}
                >
                  <TwitterIcon size={24} round />
                </TwitterShareButton>
                <LineShareButton
                  url={
                    "https://memory-cart.onrender.com/kaimono?key=" +
                    selectedList?.list_key
                  }
                  title={"共有します"}
                >
                  <LineIcon size={24} round />
                </LineShareButton>
              </Space.Compact>
            </>
          ) : null}

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

          {/* <Button
            type="primary"
            danger
            style={{ width: "100%" }}
            onClick={showDeleteConfirm}
          >
            削除
          </Button> */}

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
