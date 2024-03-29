import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

import { Button, Col, Dropdown, MenuProps, Row, Space, Tooltip } from "antd";
import {
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined,
  HeartOutlined,
  ShoppingOutlined,
  SafetyOutlined,
  SearchOutlined,
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
      router.push("/");
    }
  };

  // メニュー項目
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "品物検索",
      icon: <SearchOutlined />,
      onClick: () => openMenu("SearchMenu"),
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "お気に入り品の登録",
      icon: <HeartOutlined />,
      onClick: () => openMenu("FavoriteItemMenu"),
    },
    {
      key: "3",
      label: "ユーザー設定",
      icon: <UserOutlined />,
      onClick: () => openMenu("SettingMenu"),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "プライバシーポリシー",
      icon: <SafetyOutlined />,
      onClick: () => router.push(`/privacy`),
    },
    {
      key: "5",
      label: "ヘルプ",
      icon: <QuestionCircleOutlined />,
      onClick: () => router.push(`/help`),
    },
  ];

  return (
    <>
      <Row wrap={false}>
        <Col
          flex="auto"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100px",
          }}
        >
          {pathname === "/" ? (
            <>
              <span
                style={{
                  paddingLeft: 5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize:"smaller",
                }}
              >
                Memory Cart
              </span>
            </>
          ) : null}
          {pathname === "/help" || pathname === "/privacy" ? (
            <>
              <span
                style={{
                  paddingLeft: 5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => handleGoBack()}
                ></Button>
                {pathname == "/help" ? "ヘルプ" : ""}
                {pathname == "/privacy" ? "プライバシーポリシー" : ""}
              </span>
            </>
          ) : null}
          {pathname === "/kaimono" ? (
            <>
              <span
                style={{
                  paddingLeft: 5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/")} // 品物から戻る先はトップページ固定
                ></Button>
                {listName}

                {isShare ? (
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    onClick={() => openMenu("ShareInfoMenu", shoppingList!)}
                  ></Button>
                ) : null}
              </span>
            </>
          ) : null}
        </Col>
        <Col style={{ display: "flex", paddingRight: 5, marginTop: -2 }}>
          {pathname === "/kaimono" && shoppingItems.length > 0 ? (
            <span style={{ opacity: 0.9, fontSize: "smaller", marginTop: 10 }}>
              {shoppingItems.length} items ☑{shoppingItems.filter((m) => m.finished_at != null).length}
            </span>
          ) : null}
        </Col>
        <Col>
          <Dropdown menu={{ items }} placement="bottomRight">
            <Button type="text" icon={<SettingOutlined />}></Button>
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
