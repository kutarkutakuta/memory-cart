import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Col, Dropdown, MenuProps, Row, Tag, message } from "antd";

import {
  FormOutlined,
  LinkOutlined,
  FolderAddOutlined,
  HolderOutlined,
  MoreOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

import styles from "./ShoppingListCard.module.scss";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useRouter } from "next/navigation";
import useMenuStore from "@/stores/useMenuStore";
import { useEffect } from "react";

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
    margin: 4,
    padding: 2,
    borderRadius: 5,
  };

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div>
          品物の編集へ
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
      label: (
        <div>
          <FormOutlined />
          リストの編集
        </div>
      ),
      onClick: () => openMenu("ShoppingListMenu", item),
    },
    {
      key: "3",
      label: (
        <div>
          <LinkOutlined />
          {item.isShare ? "リストの共有を解除" : "リストを共有する"}
        </div>
      ),
      onClick: () => {
        if (item.isShare) {
          unShareShoppingList(item.id);
        } else {
          shareShoppingList(item.id);
        }
      },
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <div>
          <FolderAddOutlined />
          コピーしてリストを追加
        </div>
      ),
      onClick: () => addShoppingList(item),
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
      <Row wrap={false} align="middle">
        <Col
          flex="none"
          style={{ paddingRight: "10px", cursor: "grab", touchAction: "none" }}
          data-enable-dnd="true"
        >
          <HolderOutlined />
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
                <Tag icon={<LinkOutlined />} style={{cursor:"pointer"}} color="#00A000" onClick={() =>{
                  navigator.clipboard.writeText(
                    item.list_key || ""
                  );
                  messageApi.open({
                    type: "info",
                    content: "クリップボードに共有キーをコピーしました。",
                  });
                }
                }>
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
