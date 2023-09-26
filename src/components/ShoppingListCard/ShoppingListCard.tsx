import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Checkbox, Col, Row, Tag } from "antd";
import {
  ArrowRightOutlined,
  FormOutlined,
  LinkOutlined,
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
  const { openShoppingList } = useMenuStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // スタイル調整用
    margin: 4,
    padding: 2,
    borderRadius: 5,
    cursor: "grab",
  };

  const onChangeShopped = () => {
    // const updateItem = item;
    // if (item.finished_at) {
    //   item.finished_at = null;
    //   item.finished_user = null;
    // } else {
    //   item.finished_at = new Date();
    //   item.finished_user = user ? user.id! : null;
    // }
    // updateShoppingItem(updateItem);
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
        <Col flex="none" style={{ padding: 5 }}>
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
                onClick={() => openShoppingList(item)}
              />
              <Button
                data-dndkit-disabled-dnd-flag="true"
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => router.push(`/kaimono?key=${item.url_key}`)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ShoppingListCard;
