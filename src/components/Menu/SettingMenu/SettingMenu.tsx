"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Drawer,
  Input,
  Space,
  message,
  Select,
  Form,
} from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";

import { useSettingMenu } from "./useSettingMenu";
import { useEffect } from "react";
import useMasterStore from "@/stores/useMasterStore";

export function SettingMenu() {
  // メニュー制御用Hook
  const { openFlag, closeMenu } = useMenuStore();

  const { appSetting, updateSetting } = useMasterStore();

  // フォーム制御用Hook
  const { formData, initialFormData, handleChange } = useSettingMenu();

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    initialFormData(appSetting!);
  }, [openFlag["SettingMenu"]]);

  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <>
            <UserOutlined />
            <span style={{ paddingLeft: 4 }}>ユーザー設定</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openFlag["SettingMenu"]}
        onClose={() => closeMenu("SettingMenu")}
      >
        <Form>
          <Form.Item label="ユーザー名">
          <Input
            placeholder="ユーザー名"
            maxLength={20}
            value={formData.user_name}
            onChange={(e) => handleChange("user_name", e.target.value)}
          />
          </Form.Item>
          <Form.Item label="フォントサイズ">
          <Select
            placeholder="フォントサイズ"
            options={[
              { value: "14px", label: "小さい" },
              { value: "16px", label: "普通" },
              { value: "18px", label: "大きい" },
              { value: "20px", label: "すごく大きい" },
            ]}
            value={formData.font_size}
            onChange={(e) => handleChange("font_size", e)}
          />
          </Form.Item>
          <Form.Item label="テーマカラー">
          <Select
            placeholder="テーマカラー"
            options={[
              { value: "dark", label: "ダーク" },
              { value: "light", label: "ライト" },
            ]}
            value={formData.theme}
            onChange={(e) => handleChange("theme", e)}
          />
          </Form.Item>
        </Form>

        <Space direction="vertical" size="middle" style={{ display: "flex" }}>

          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={() => {
              updateSetting(formData);
              closeMenu("SettingMenu");
            }}
          >
            更新
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => {
              closeMenu("SettingMenu");
            }}
          >
            キャンセル
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
