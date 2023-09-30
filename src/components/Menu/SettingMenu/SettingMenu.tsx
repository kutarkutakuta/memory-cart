import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Input, Space, Select, Form } from "antd";
import { UserOutlined } from "@ant-design/icons";

import useMasterStore from "@/stores/useMasterStore";

export function SettingMenu() {
  // メニュー用Hook
  const { openFlag, closeMenu } = useMenuStore();
  // マスター用Hook
  const { appSetting, updateSetting } = useMasterStore();

  return (
    <>
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
              value={appSetting!.user_name}
              onChange={(e) => updateSetting({ user_name: e.target.value })}
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
              value={appSetting!.font_size}
              onChange={(e) => updateSetting({ font_size: e })}
            />
          </Form.Item>
          <Form.Item label="テーマカラー">
            <Select
              placeholder="テーマカラー"
              options={[
                { value: "dark", label: "ダーク" },
                { value: "light", label: "ライト" },
              ]}
              value={appSetting!.theme}
              onChange={(e) => updateSetting({ theme: e })}
            />
          </Form.Item>
        </Form>

        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Button
            style={{ width: "100%" }}
            onClick={() => {
              closeMenu("SettingMenu");
            }}
          >
            Close
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
