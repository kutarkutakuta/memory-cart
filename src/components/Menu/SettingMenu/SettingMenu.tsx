import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, Input, Space, Select, Form } from "antd";
import { UserOutlined } from "@ant-design/icons";

import useMasterStore from "@/stores/useMasterStore";
import { useEffect, useState } from "react";

export function SettingMenu() {
  // メニュー用Hook
  const { openFlag, closeMenu } = useMenuStore();
  // マスター用Hook
  const { appSetting, updateSetting } = useMasterStore();

  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    setUserName(appSetting?.user_name!);
  }, [openFlag["SettingMenu"]]);

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
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="フォントサイズ">
            <Select
              placeholder="フォントサイズ"
              options={[
                { value: 14, label: "小さい" },
                { value: 16, label: "普通" },
                { value: 18, label: "大きい" },
                { value: 20, label: "すごく大きい" },
              ]}
              value={appSetting?.font_size}
              onChange={(e) => updateSetting({ font_size: e })}
            />
          </Form.Item>
          <Form.Item label="テーマカラー">
            <Select
              placeholder="テーマカラー"
              options={[
                { value: "modern", label: "モダン" },
                { value: "dark", label: "ダーク" },
                { value: "light", label: "ライト" },
                { value: "green", label: "グリーン" },
              ]}
              value={appSetting?.theme}
              onChange={(e) => updateSetting({ theme: e })}
            />
          </Form.Item>
        </Form>

        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Button
            style={{ width: "100%" }}
            onClick={() => {
              updateSetting({ user_name:  userName});
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
