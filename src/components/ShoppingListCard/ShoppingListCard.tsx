import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Col,
  Dropdown,
  Input,
  MenuProps,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
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
  CopyOutlined,
} from "@ant-design/icons";

import styles from "./ShoppingListCard.module.scss";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useRouter } from "next/navigation";
import useMenuStore from "@/stores/useMenuStore";
import { useEffect, useState } from "react";
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
import ShareConfirm from "../Menu/ShareConfirm/ShareConfirm";

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
              : "削除したリストは元に戻せません。") +
            "削除しますか？",
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
      label: "リストを共有する",
      icon: <LinkOutlined />,
      onClick: () => {
        shareShoppingList(item.id).then((share_key) => {
          modal.info(ShareConfirm("リストを共有しました。", share_key!, item.name!));
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
              サーバー上の共有データが削除されて、共有相手全員の共有が解除されます。
              <br />
              共有を解除しますか？
            </>
          ),
          okText: "共有解除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk: () => {
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
                <Tooltip title="共有中">
                  <Button
                type="text"
                icon={<LinkOutlined />}
                size="small"
                onClick={()=>modal.info(ShareConfirm("リストを共有しています", item.list_key, item.name!))}
              ></Button>
                </Tooltip>
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
