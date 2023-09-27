import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Col,
  Dropdown,
  MenuProps,
  Row,
  Tag,
} from "antd";

import {
  FormOutlined,
  LinkOutlined,
  FolderAddOutlined,
  HolderOutlined,
  MoreOutlined,
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

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div data-dndkit-disabled-dnd-flag="true">
          <FormOutlined />
          リストの編集
        </div>
      ),
      onClick: () => openMenu("ShoppingListMenu", item),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: (
        <div data-dndkit-disabled-dnd-flag="true">
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
      <Row wrap={false} align="middle">
        <Col flex="none" style={{paddingRight:"10px"}}>
          <HolderOutlined />
        </Col>
        <Col flex="auto">
          <Button
            data-dndkit-disabled-dnd-flag="true"
            type="text"
            style={{
              whiteSpace: "normal",
              height: "auto",
              textAlign: "left",
              padding:0
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
                <Tag icon={<LinkOutlined />} color="#55acee">
                  共有中
                </Tag>
              ) : null}
              <Dropdown
                menu={{ items }}
                placement="bottomRight"
                data-dndkit-disabled-dnd-flag="true"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  data-dndkit-disabled-dnd-flag="true"
                />
              </Dropdown>
              {/* <Button
                data-dndkit-disabled-dnd-flag="true"
                type="text"
                icon={<ArrowRightOutlined />}
                onClick={() => router.push(`/kaimono?key=${item.list_key}`)}
              /> */}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ShoppingListCard;
