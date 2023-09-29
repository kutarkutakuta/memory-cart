"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

import { Button, Col, Dropdown, MenuProps, Row, Space, Tag, Typography } from "antd";
import {
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useMenuStore from "@/stores/useMenuStore";
import { SettingMenu } from "./Menu/SettingMenu/SettingMenu";

const { Paragraph } = Typography;

const MyHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  
  // メニュー制御用Hook
  const { openMenu } = useMenuStore();
  
  // 買物リスト操作用Hook
  const { shoppingList } = useShoppingItemStore();

  const handleGoBack = () => {
    // 履歴が存在する場合のみ戻る操作を実行
    if (router && router.back) {
      if (
        !document.referrer ||
        (document.referrer &&
          document.referrer.indexOf(window.location.origin) === -1)
      ) {
        // 自分のサイト外のページに戻る場合、トップページに遷移
        router.push("/");
      } else {
        router.back();
      }
    } else {
      // 履歴が存在しない場合ホームページにリダイレクト
      router.push("/");
    }
  };

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "ユーザー設定",
      icon: <UserOutlined />,
      onClick: ()=> openMenu("SettingMenu")
    },
    {
      key: "2",
      label: "よく使う品物の登録",
      icon: <ShoppingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "ヘルプ",
      icon: <QuestionCircleOutlined />,
    },
  ];
  
  return (
    <>
    <Row wrap={false} align={"middle"}>
      <Col flex="auto">
        <Row justify="start">
          <Col>
            <Paragraph ellipsis={true} style={{margin:0,}}>
              {pathname == "/" ? (
                <span style={{ paddingLeft: 10}}>買物リスト</span>
              ) : (
                <>
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => handleGoBack()}
                  ></Button>
                  <Space>
                    <span>{shoppingList?.name}</span>
                    {shoppingList?.isShare ? (
                      <Tag icon={<LinkOutlined />} color="#2E8B57">
                        共有中
                      </Tag>
                    ) : null}
                  </Space>
                </>
              )}
            </Paragraph>
          </Col>
        </Row>
      </Col>
      <Col flex="none">
        <Row justify="end">
          <Col>
            <Space>
              <Dropdown menu={{ items }} placement="bottomRight">
                  <Button type="text" icon={<SettingOutlined />}></Button>
                </Dropdown>
            </Space>
          </Col>
        </Row>
      </Col>
    </Row>
    <SettingMenu></SettingMenu>
    </>
  );
};
export default MyHeader;
