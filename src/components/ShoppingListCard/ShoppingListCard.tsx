import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Col,
  Dropdown,
  MenuProps,
  Modal,
  Row,
  Tooltip,
  message,
} from "antd";

import {
  FormOutlined,
  LinkOutlined,
  CopyOutlined,
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
  const [modal, contextHolder2] = Modal.useModal();
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
      label: "名前の変更",
      icon: <FormOutlined />,
      onClick: () => openMenu("ShoppingListMenu", item),
    },
    {
      key: "6",
      label: "コピー",
      icon: <CopyOutlined />,
      onClick: () => {
        addShoppingList(item).then(() =>
          messageApi.info(item.name + "をコピーしました。")
        );
      },
    },
    {
      key: "3",
      label: "削除",
      icon: <DeleteFilled />,
      onClick: () => {
        modal.confirm({
          title: item.isShare
            ? "共有中の買い物リストを削除しようとしています！"
            : item.name + "を削除します",
          icon: <ExclamationCircleFilled />,
          content:
            (item.isShare
              ? "サーバー上の共有データを削除したい場合は先に共有を解除してください。" + item.name + "を削除しますか？"
              : "よろしいですか？") ,
          okText: "削除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk: () => {
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
      label: "共有する",
      icon: <LinkOutlined />,
      onClick: () => {
        shareShoppingList(item.id).then((share_key) => {
          item.list_key = share_key!;
          openMenu("ShareInfoMenu", item);
        });
      },
      disabled: item.isShare,
    },
    {
      key: "5",
      label: "共有を解除",
      icon: <DisconnectOutlined />,
      onClick: async () => {
        modal.confirm({
          title: "共有を解除します。",
          icon: <ExclamationCircleFilled />,
          content: (
            <>
              サーバー上の共有データが削除されます。
              <br />
              よろしいですか？
            </>
          ),
          okText: "共有解除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk: () => {
            unShareShoppingList(item.id!).then(() =>
              messageApi.info("共有を解除しました。")
            );
          },
        });
      },
      disabled: !item.isShare,
    },
  ];

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
              width: "100%",
            }}
            onClick={() => router.push(`/kaimono?key=${item.list_key}`)}
          >
            {item.name}
          <span
            style={{
              fontSize: "smaller",
              opacity: 0.7,
              textAlign: "center",
              whiteSpace: "nowrap",
              paddingLeft: 4,
            }}
          >
            {item.itemCount! > 0 ? <span>{item.itemCount} ☑{item.finishedCount}</span> : null}
          </span>
          </Button>
        </Col>
        <Col flex="none">
          <Row justify="end">
            <Col>
              {item.isShare ? (
                <Button
                  type="text"
                  icon={<LinkOutlined />}
                  size="small"
                  onClick={() => openMenu("ShareInfoMenu", item)}
                ></Button>
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
