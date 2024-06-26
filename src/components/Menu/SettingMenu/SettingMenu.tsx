import useMenuStore from "@/stores/useMenuStore";
import { Drawer, Input, Select, Form } from "antd";
import { SettingOutlined } from "@ant-design/icons";

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
           <SettingOutlined />
            <span style={{ paddingLeft: 4 }}>ユーザー設定</span>
          </>
        }
        placement={"top"}
        width={330}
        open={openFlag["SettingMenu"]}
        onClose={() => closeMenu("SettingMenu")}
      >
        <Form layout = {"horizontal"}
        labelCol={{ flex: '160px' }}
        labelAlign="right"
        labelWrap
        wrapperCol={{ flex: 1 }}
        colon={false}>
          <Form.Item label="ユーザー名">
            <Input style={{width: 180}}
              placeholder="ユーザー名"
              maxLength={10}
              value={userName}
              onChange={e=>setUserName(e.target.value)}
              onBlur={()=>updateSetting({ user_name: userName })}
            />
          </Form.Item>
          <Form.Item label="フォントサイズ">
            <Select style={{width: 180}}
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
            <Select style={{width: 180}}
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

        {/* <Divider></Divider>

        <Button
          style={{ width: "100%" }}
          onClick={() => {
            updateSetting({ user_name: userName });
            closeMenu("SettingMenu");
          }}
        >
          Close
        </Button> */}
      </Drawer>
    </>
  );
}
