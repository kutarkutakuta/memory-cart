"use client";
import useShoppingItemStore, {
  ShoppingItem,
} from "@/stores/useShoppingItemStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Checkbox,
  Col,
  Typography,
  Row,
  Space,
  Tag,
  Tooltip,
  Dropdown,
  MenuProps,
} from "antd";
import {
  HolderOutlined,
  EditOutlined,
  MoreOutlined,
  ExclamationCircleTwoTone,
  MessageTwoTone,
  DeleteOutlined,
} from "@ant-design/icons";

import styles from "./ShoppingCard.module.scss";
import useMenuStore from "@/stores/useMenuStore";
import useMasterStore from "@/stores/useMasterStore";

const { Paragraph } = Typography;

interface ShoppingCardProps {
  item: ShoppingItem;
}

const ShoppingCard = ({ item }: ShoppingCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // スタイル調整用
    margin: 2,
    borderRadius: 5,
  };

  const { removeShoppingItems, updateShoppingItems } = useShoppingItemStore();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // マスター用Hook
  const { categories } = useMasterStore();

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "品物の編集",
      icon: <EditOutlined />,
      onClick: () => openMenu("EditItemMenu", undefined, item),
    },
    {
      key: "2",
      label: "品物の削除",
      icon: <DeleteOutlined />,
      onClick: () => removeShoppingItems([item.id!]),
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "￥ 金額を入力",
      onClick: () => openMenu("PriceMenu", undefined, item),
    },
    {
      type: "divider",
    },
  ];

  /**
   * 買物済みチェック変更時
   */
  const onChangeShopped = () => {
    updateShoppingItems([item.id!], {
      finished_at: item.finished_at == null ? new Date() : null,
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={styles.memberCard}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Row wrap={false} align={"middle"} >
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
          <Space>
            <Checkbox
              checked={item.finished_at != null}
              onChange={onChangeShopped}
            ></Checkbox>
            <Button
              type="text"
              style={{
                whiteSpace: "normal",
                height: "auto",
                maxWidth: "220px",
                textAlign: "left",
                padding: 0,
              }}
              onClick={() => openMenu("EditItemMenu", undefined, item)}
            >
              <span
                style={{
                  textDecoration: item.finished_at ? "line-through" : "",
                }}
              >
                {item.name}
              </span>
            </Button>

            {item.amount ? (
              <span
                style={{
                  fontSize: "smaller",
                  fontWeight: "lighter",
                }}
              >
                {item.amount}
                {item.unit}
              </span>
            ) : null}

            {item.priority ? (
              <Tooltip trigger="click" title={item.priority}>
                <ExclamationCircleTwoTone
                  twoToneColor={
                    item.priority == "高くても買う"
                      ? "#eb2f96"
                      : item.priority == "価格を見て決める"
                      ? "#52c41a"
                      : ""
                  }
                />
              </Tooltip>
            ) : null}

            {item.memo ? (
              <Tooltip title={item.memo} trigger="click">
                <MessageTwoTone />
              </Tooltip>
            ) : null}
          </Space>
        </Col>
        <Col flex="none">
          <Row justify="end">
            <Col>
              <Tag
                color={
                  categories.find((n) => n.name == item.category_name)?.bgcolor!
                }
                style={{
                  color: categories.find((n) => n.name == item.category_name)
                    ?.color!,
                }}
                bordered={false}
              >
                {item.category_name}
              </Tag>
              {/* <Button
              size="small"
                type="text"
                onClick={() => openMenu("PriceMenu", undefined, item)}
              >￥</Button> */}
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

export default ShoppingCard;
