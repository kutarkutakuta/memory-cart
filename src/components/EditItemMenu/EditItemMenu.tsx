"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tag,
} from "antd";
import {
  ShoppingOutlined,
  LinkOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
const {TextArea} = Input;

import styles from "./EditItemMenu.module.scss";
import useMasterStore from "@/stores/useMasterStore";
import { useEditItemMenu } from "./useEditItemMenu";
import { useEffect } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";

export function EditItemMenu() {
  // メニュー制御用Hook
  const { openItem, closeShoppingItem } = useMenuStore();

  // マスター用Hook
  const { categories, units } = useMasterStore();

  // 品物制御用Hook
  const { updateShoppingItem } = useShoppingItemStore();

  // フォーム用Hook
  const { formData, initialFormData, handleChange } = useEditItemMenu();
  useEffect(() => {
    initialFormData(openItem);
  }, [openItem]);

  const getCategoryOption = () => {
    return categories.map((m) => ({ label: m.name, value: m.name }));
  };

  const { Option } = Select;
  return (
    <>
      <Drawer
        title={
          <>
            <ShoppingOutlined />
            <span style={{ paddingLeft: 4 }}>品物の編集</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openItem != null}
        onClose={closeShoppingItem}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Input
            placeholder="品物の名前"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <Select
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="カテゴリ"
            options={getCategoryOption()}
            value={formData.category_name}
            onChange={(e) => handleChange("category_name", e)}
          />
          <Space.Compact block>
            <InputNumber
              placeholder="数量"
              style={{ width: "200px" }}
              value={formData.amount}
              onChange={(e) => handleChange("amount", e)}
            />

            <Select
              style={{ width: 100 }}
              options={units.map((m) => ({ label: m.name, value: m.name }))}
              value={formData.unit}
              onChange={(e) => handleChange("unit", e)}
            ></Select>
          </Space.Compact>

          <Select
            placeholder="優先度"
            style={{ width: "100%" }}
            value={formData.priority}
            onChange={(e) => handleChange("priority", e)}
          >
            <Option value="高くても買う">高くても買う</Option>
            <Option value="安かったら買う">安かったら買う</Option>
            <Option value="価格を見て決める">価格を見て決める</Option>
          </Select>

          <TextArea
            rows={4}
            placeholder="メモ"
            value={formData.memo}
            onChange={(e) => handleChange("memo", e.target.value)}
          />

          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={(e) => {
              updateShoppingItem(formData.id, formData);
              closeShoppingItem();
            }}
          >
            更新
          </Button>

          <Button style={{ width: "100%" }}>キャンセル</Button>
        </Space>
      </Drawer>
    </>
  );
}
