import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Checkbox, Col, Row, Tag, Tooltip } from "antd";

import {
  ArrowRightOutlined,
  FormOutlined,
  LinkOutlined,
  FolderAddOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

import styles from "./ShoppingListCard.module.scss";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useRouter } from "next/navigation";
import useMenuStore from "@/stores/useMenuStore";

interface ShoppingCardProps {
  item: ShoppingList;
}

const ShoppingListCard = ({ item }: ShoppingCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const router = useRouter();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // 買い物リスト制御用Hook
  const { addShoppingList } = useShoppingListStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // スタイル調整用
    margin: 4,
    padding: 2,
    borderRadius: 5,
    cursor: "grab",
  };



  return (
    <div
      ref={setNodeRef}
      className={styles.memberCard}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Row>
        <Col flex="none">
              <Tooltip title="コピーしたリストを追加">
              <Button
                data-dndkit-disabled-dnd-flag="true"
                type="text"
                icon={<FolderAddOutlined />}
                onClick={() => {
                  addShoppingList(item);
                }}
              ></Button>
              </Tooltip>
          {item.name}
        </Col>
        <Col flex="auto">
          <Row justify="end">
            <Col>
              {item.isShare ? (
                <Tag icon={<LinkOutlined />} color="#55acee">
                  共有中
                </Tag>
              ) : null}
              <Button
                data-dndkit-disabled-dnd-flag="true"
                type="text"
                icon={<FormOutlined />}
                onClick={() => openMenu("ShoppingListMenu", item)}
              />
              <Button
                data-dndkit-disabled-dnd-flag="true"
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => router.push(`/kaimono?key=${item.list_key}`)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ShoppingListCard;
