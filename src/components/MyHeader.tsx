import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

import { Button, Col, Dropdown, MenuProps, Row, Space, Tooltip } from "antd";
import {
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  LinkOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useMenuStore from "@/stores/useMenuStore";
import { SettingMenu } from "./Menu/SettingMenu/SettingMenu";
import { FavoriteItemMenu } from "./Menu/FavoireItemMenu/FavoriteItemMenu";
import { SearchMenu } from "./Menu/SearchMenu/SearchMenu";

const MyHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // 買物リスト操作用Hook
  const { shoppingList, shoppingItems } = useShoppingItemStore();

  const [listName, setListName] = useState<string>("");
  const [isShare, setisShare] = useState<boolean>(false);

  useEffect(() => {
    setListName(shoppingList?.name!);
    setisShare(shoppingList?.isShare!);
    return () => {
      setListName("");
      setisShare(false);
    };
  }, [shoppingList]);

  const handleGoBack = () => {
    // 履歴が存在する場合のみ戻る操作を実行
    if (router && router.back) {
      router.back();
    } else {
      // 履歴が存在しない場合ホームページにリダイレクト
    }
    router.push("/");
  };

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "5",
      label: "ヘルプ",
      icon: <QuestionCircleOutlined />,
      onClick: () => router.push(`/help`),
    },
    {
      key: "4",
      label: "プライバシーポリシー",
      icon: <SafetyOutlined />,
      onClick: () => router.push(`/privacy`),
    },
  ];

  return (
    <>
      <Row wrap={false} align="top">
        <Col
          flex="auto"
          style={{
            paddingLeft: 5,
          }}
        >
          {pathname === "/" ? (
            <>
              <span
                style={{
                  paddingLeft: 5,
                  fontSize: "smaller",
                }}
              >
                Memory Cart
              </span>
            </>
          ) : null}
          {pathname === "/kaimono" || pathname === "/help" || pathname === "/privacy" ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "smaller",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  lineHeight: "1",
                }}
              >
                <Button
                style={{
                  marginRight: 5,

                }}
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => handleGoBack()}
                ></Button>

                {pathname === "/kaimono" ? (
                  <>
                    {listName}
                    {isShare ? (
                      <Button
                        type="text"
                        icon={<LinkOutlined />}
                        onClick={() => openMenu("ShareInfoMenu", shoppingList!)}
                      ></Button>
                    ) : null}
                  </>
                ) : null}
                {pathname === "/help" ? "ヘルプ" : null}
                {pathname === "/privacy" ? "プライバシーポリシー" : null}
              </div>
            </>
          ) : null}
          
        </Col>
        <Col>
          <Dropdown menu={{ items }} placement="bottomRight">
            <div><Button
              type="text"
              icon={<QuestionCircleOutlined />}
            ></Button>&nbsp;</div>
          </Dropdown>
        </Col>
      </Row>
      <SettingMenu></SettingMenu>
      <FavoriteItemMenu></FavoriteItemMenu>
      <SearchMenu></SearchMenu>
    </>
  );
};
export default MyHeader;
