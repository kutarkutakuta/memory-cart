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
} from "antd";
import {
  HolderOutlined,
  FormOutlined,
  MoneyCollectOutlined,
  ExclamationCircleTwoTone,
  MessageTwoTone,
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
    margin: 4,
    padding: 2,
    borderRadius: 5,
  };

  const { removeShoppingItem, finishShoppingItem, updateShoppingItem } =
    useShoppingItemStore();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // マスター用Hook
  const { categories } = useMasterStore();

  /**
   * 買物済みチェック変更時
   */
  const onChangeShopped = () => {
    updateShoppingItem(item.id!, {
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
          <HolderOutlined />
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
                <ExclamationCircleTwoTone  twoToneColor={
                  item.priority == "高くても買う" ? "#eb2f96" : (item.priority == "価格を見て決める" ? "#52c41a" : "") 
                } />
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
              <Button
                type="text"
                icon={<MoneyCollectOutlined />}
                onClick={() => openMenu("PriceMenu", undefined, item)}
              ></Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default ShoppingCard;
