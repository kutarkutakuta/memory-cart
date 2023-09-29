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
      <Row wrap={false} align={"middle"}>
        <Col
          flex="none"
          style={{ paddingRight: "10px", cursor: "grab", touchAction: "none" }}
          data-enable-dnd="true"
        >
          <div style={{ paddingLeft: 5, paddingRight: 5 }}>
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
                  lineHeight: 0.8,
                }}
              >
                {item.name}
              </span>
            </Button>

            <div
              style={{
                fontSize: "smaller",
                fontWeight: "lighter",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ marginTop: -5 }}>
                {" "}
                {item.amount ? <span>{item.amount}</span> : null}
              </div>
              <div style={{ marginTop: -5 }}>
                {" "}
                {item.amount ? <span>{item.unit}</span> : null}
              </div>
            </div>

            <div>
              <div style={{ marginTop: -5 }}>
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
              </div>
              <div style={{ marginTop: -5 }}>
                {item.memo ? (
                  <Tooltip title={item.memo} trigger="click">
                    <MessageTwoTone />
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </Space>
        </Col>
        <Col flex="none">
          <div style={{ marginTop: -5 }}>
            {item.buying_price ? (
              <Tooltip
                trigger="click"
                title={"￥" + item.buying_price.toLocaleString()}
              >
                <Button type="text" shape="circle" size={"small"}>
                  ￥
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </Col>
        <Col flex="none">
          <div style={{ textAlign: "right" }}>
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
          </div>
          {/* <div
            style={{
              fontSize: "smaller",
              marginRight: "6px",
              textAlign: "right",
            }}
          >
            {item.buying_price ? "￥" + item.buying_price.toLocaleString() : ""}
            {item.buying_amount
              ? "(" + item.buying_amount + (item.buying_unit || "") + ")"
              : ""}
          </div> */}
        </Col>
        <Col flex="none">
          <Row justify="end">
            <Col>
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
