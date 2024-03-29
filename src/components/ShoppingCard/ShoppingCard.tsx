"use client";
import parse from "html-react-parser";
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
  Popover,
  Modal,
  Select,
  message,
} from "antd";
import {
  HolderOutlined,
  EditOutlined,
  MoreOutlined,
  ExclamationCircleTwoTone,
  MessageTwoTone,
  DeleteOutlined,
  ExclamationCircleFilled,
  CopyOutlined,
} from "@ant-design/icons";

import styles from "./ShoppingCard.module.scss";
import useMenuStore from "@/stores/useMenuStore";
import useMasterStore from "@/stores/useMasterStore";
import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useState } from "react";

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

  // マスター用Hook
  const { categories } = useMasterStore();
  // 買物リスト用Hook
  const { shoppingLists } = useShoppingListStore();
  // 品物用Hook
  const { removeShoppingItems, updateShoppingItems, copyShoppingItem } =
    useShoppingItemStore();
  // メニュー制御用Hook
  const { openMenu } = useMenuStore();
  // メッセージ用Hook
  const [modal, contextHolder] = Modal.useModal();
  // メッセージ用Hook
  const [messageApi, contextHolder2] = message.useMessage();

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
      label: "コピー",
      icon: <CopyOutlined />,
      onClick: () => handleOpenCopy(),
    },
    {
      key: "3",
      label: "削除",
      icon: <DeleteOutlined />,
      onClick: () =>
        modal.confirm({
          title: item.name + "を削除します",
          icon: <ExclamationCircleFilled />,
          content: "よろしいですか？",
          okText: "削除",

          okType: "primary",
          cancelText: "キャンセル",
          onOk: () => {
            removeShoppingItems([item.id!]);
          },
        }),
    },
    {
      type: "divider",
    },
    {
      key: "4",
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

  const [openCopy, setOpenCopy] = useState(false);
  const [selectedListKey, setSelectedListKey] = useState<string | null>(null);
  const [deleteFromList, setDeleteFromList] = useState<boolean>(false);
  const handleOpenCopy = () => {
    setSelectedListKey(null);
    setDeleteFromList(false);
    setOpenCopy(true);
  };

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

      <Modal
        title={`${item.name}をコピーします`}
        open={openCopy}
        onOk={() => {
          if (selectedListKey) {
            copyShoppingItem(selectedListKey, item).then(() => {
              if (deleteFromList) {
                removeShoppingItems([item.id!]);
              }
              messageApi.success(`コピーしました`);
              setOpenCopy(false);
            });
          } else {
            messageApi.error("コピー先の買い物リストを選択して下さい");
          }
        }}
        onCancel={() => setOpenCopy(false)}
      >
        <Select
          showSearch
          allowClear
          style={{ width: "100%" }}
          placeholder="コピー先の買い物リスト"
          options={shoppingLists
            .filter((m) => m.list_key !== item.list_key)
            .map((m) => ({ label: m.name, value: m.list_key }))}
          value={selectedListKey}
          onChange={(e) => setSelectedListKey(e)}
        />
        <br />
        <Checkbox
          checked={deleteFromList}
          onChange={() => setDeleteFromList(!deleteFromList)}
        >
          このリストから削除する
        </Checkbox>
      </Modal>

      <Row wrap={false} align={"middle"}>
        <Col flex="auto" style={{ paddingLeft: "10px" }}>
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
                <span
                  style={{
                    fontSize: "smaller",
                    opacity: 0.7,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    paddingLeft: 4,
                  }}
                >
                  {item.amount}{item.unit}
                </span>
              </span>
            </Button>

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
        <Col>
          <div style={{ marginTop: -5 }}>
            {item.buying_price ? (
              <Popover
                content={
                  <div style={{ textAlign: "right" }}>
                    <p>{"￥" + item.buying_price.toLocaleString()}</p>
                    <p>
                      {item.buying_amount
                        ? "(" +
                          item.buying_amount.toLocaleString() +
                          (item.buying_unit || "") +
                          ")"
                        : null}
                    </p>
                  </div>
                }
              >
                <Tag style={{ cursor: "pointer" }}>￥</Tag>
              </Popover>
            ) : null}
          </div>
        </Col>
        <Col style={{ display: "flex", textAlign: "right" }}>
          {item.category_name && item.category_name.includes("/") ? (
            <Tag
              color={
                categories.find((n) => n.name == item.category_name)?.bgcolor!
              }
              style={{
                lineHeight: "0.9",
                color: categories.find((n) => n.name == item.category_name)
                  ?.color!,
              }}
              bordered={false}
            >
              {parse(item.category_name?.replace("/", "/<br />"))}
            </Tag>
          ) : (
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
          )}
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
