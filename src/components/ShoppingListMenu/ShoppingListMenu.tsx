"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  Radio,
  RadioChangeEvent,
  Space,
  Switch,
  Tooltip,
} from "antd";
const { TextArea } = Input;
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  ShoppingCartOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import styles from "./ShoppingListMenu.module.scss";
import useShoppingListStore from "@/stores/useShoppingListStore";
import { useShoppingListMenu } from "./useShoppingListMenu";
import { useEffect } from "react";

export function ShoppingListMenu() {
  // メニュー制御用Hook
  const { openList, closeShoppingList } = useMenuStore();

  // 買い物リスト制御用Hook
  const { removeShoppingList, updateShoppingList } = useShoppingListStore();

  // フォーム制御用Hook
  const { formData, initialFormData, handleChange } = useShoppingListMenu();

  useEffect(() => {
    initialFormData(openList);
  }, [openList]);

  return (
    <>
      <Drawer
        title={
          <>
            <ShoppingCartOutlined />
            <span style={{ paddingLeft: 4 }}>リストの設定</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openList != null}
        onClose={closeShoppingList}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Input
            placeholder="リストの名前"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <TextArea
            rows={4}
            placeholder="メモ"
            value={formData.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          <Checkbox
            checked={formData.isShare}
            onChange={(e) => handleChange("isShare", e.target.checked)}
          >
            共有する
            <Tooltip title="共有したい相手に共有キーを渡します。">
              <QuestionCircleOutlined />
            </Tooltip>
          </Checkbox>
          {formData.isShare ? (
            <>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={openList?.url_key || ""}
                  readOnly
                  bordered={false}
                  style={{ backgroundColor: "lightgray" }}
                />
                <Button type="primary" ghost>
                  <CopyOutlined />
                </Button>
              </Space.Compact>
            </>
          ) : null}

          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={() => {
              updateShoppingList(formData.id, formData);
              closeShoppingList();
            }}
          >
            更新
          </Button>

          <Button
            type="primary"
            danger
            style={{ width: "100%" }}
            onClick={() => {
              removeShoppingList(formData.id!);
              closeShoppingList();
            }}
          >
            削除
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => {
              closeShoppingList();
            }}
          >
            キャンセル
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
