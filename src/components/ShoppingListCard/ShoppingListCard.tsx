import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Col,
  Dropdown,
  MenuProps,
  Modal,
  Row,
  Tag,
  message,
} from "antd";

import {
  FormOutlined,
  LinkOutlined,
  FolderAddOutlined,
  HolderOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  DisconnectOutlined,
  DeleteFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import styles from "./ShoppingListCard.module.scss";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useRouter } from "next/navigation";
import useMenuStore from "@/stores/useMenuStore";
import { useEffect, useState } from "react";

interface ShoppingCardProps {
  item: ShoppingList;
}

const ShoppingListCard = ({ item }: ShoppingCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  // ルーター制御用Hook
  const router = useRouter();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // 買い物リスト制御用Hook
  const {
    loading,
    error,
    addShoppingList,
    shareShoppingList,
    unShareShoppingList,
    removeShoppingList,
  } = useShoppingListStore();

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (error)
      messageApi.open({
        type: "error",
        content: error?.message,
      });
  }, [error]);

  // カード形式調整用スタイル
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    margin: 2,
    borderRadius: 5,
  };

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div>
          品物の入力へ　
          <ArrowRightOutlined />
        </div>
      ),
      onClick: () => router.push(`/kaimono?key=${item.list_key}`),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "リストの編集",
      icon: <FormOutlined />,
      onClick: () => openMenu("ShoppingListMenu", item),
    },
    {
      key: "3",
      label: "リストの削除",
      icon: <DeleteFilled />,
      onClick: () => {
        modal.confirm({
          title: item.isShare
            ? "共有中のリストを削除しようとしています！"
            : "リストを削除します",
          icon: <ExclamationCircleFilled />,
          content:
            (item.isShare
              ? "サーバー上の共有データも削除するには共有解除を行ってください。"
              : "削除したリストは元に戻せません！") +
            "削除してよろしいですか？",
          okText: "削除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk() {
            removeShoppingList(item.id!).then(() =>
              messageApi.info("リストを削除しました。")
            );
          },
        });
      },
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "リストを共有する",
      icon: <LinkOutlined />,
      onClick: () => {
        shareShoppingList(item.id).then(() => {
          modal.info({
            title: "リストを共有しました。",
            content: <>発行された共有キーを共有相手に渡してください。</>,
          });
        });
      },
      disabled: item.isShare,
    },
    {
      key: "5",
      label: "リストの共有を解除",
      icon: <DisconnectOutlined />,
      onClick: async () => {
        modal.confirm({
          title: "リストの共有を解除します。",
          icon: <ExclamationCircleFilled />,
          content: (
            <>
              サーバー上の共有データが削除され、共有相手全員の共有が解除されます。
              <br />
              共有を解除してよろしいですか？
            </>
          ),
          okText: "共有解除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk() {
            unShareShoppingList(item.id!).then(() =>
              messageApi.info("リストの共有を解除しました。")
            );
          },
        });
      },
      disabled: !item.isShare,
    },
    {
      type: "divider",
    },
    {
      key: "6",
      label: "コピーしてリストを追加",
      icon: <FolderAddOutlined />,
      onClick: () => {
        addShoppingList(item).then(() =>
          messageApi.info("コピーしたリストを追加しました。")
        );
      },
    },
  ];
  const [modal, contextHolder2] = Modal.useModal();

  return (
    <div
      ref={setNodeRef}
      className={styles.memberCard}
      style={style}
      {...attributes}
      {...listeners}
    >
      {contextHolder}
      {contextHolder2}

      <Row wrap={false} align="middle">
        <Col
          flex="none"
          style={{ paddingRight: "10px", cursor: "grab", touchAction: "none" }}
          data-enable-dnd="true"
        >
          <div style={{ padding: 5 }}>
            <HolderOutlined />
          </div>
        </Col>
        <Col flex="auto">
          <Button
            type="text"
            style={{
              whiteSpace: "normal",
              height: "auto",
              textAlign: "left",
              padding: 0,
            }}
            onClick={() => router.push(`/kaimono?key=${item.list_key}`)}
          >
            {item.name}
          </Button>
        </Col>
        <Col flex="none">
          <Row justify="end">
            <Col>
              {item.isShare ? (
                <Tag
                  icon={<LinkOutlined />}
                  style={{ cursor: "pointer" }}
                  color="#2E8B57"
                  onClick={() => {
                    navigator.clipboard.writeText(item.list_key || "");
                    messageApi.info(
                      "共有キーをクリップボードにコピーしました。"
                    );
                  }}
                >
                  共有中
                </Tag>
              ) : null}
              <Dropdown menu={{ items }} placement="bottomRight">
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ShoppingListCard;
