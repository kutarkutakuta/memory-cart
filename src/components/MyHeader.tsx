import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

import {
  Button,
  Col,
  Dropdown,
  MenuProps,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LinkOutlined,
  SettingOutlined,
  HeartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useMenuStore from "@/stores/useMenuStore";
import { SettingMenu } from "./Menu/SettingMenu/SettingMenu";
import { FavoriteItemMenu } from "./Menu/FavoireItemMenu/FavoriteItemMenu";
import modal from "antd/es/modal";
import ShareConfirm from "./Menu/ShareConfirm/ShareConfirm";

const { Paragraph } = Typography;

const MyHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // 買物リスト操作用Hook
  const { shoppingList } = useShoppingItemStore();

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
      onClick: () => openMenu("SettingMenu"),
    },
    {
      key: "2",
      label: "お気に入り品の登録",
      icon: <HeartOutlined />,
      onClick: () => openMenu("FavoriteItemMenu"),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "ヘルプ",
      icon: <QuestionCircleOutlined />,
    },
  ];

  return (
    <>
      <Row wrap={false} align={"middle"}>
        <Col
          flex="auto"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100px",
          }}
        >
          {pathname == "/" ? (
            <>
              <span
                style={{
                  paddingLeft: 10,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <ShoppingOutlined />
                お買い物リスト
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  paddingLeft: 10,
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
                {listName}
                
              {isShare ? (
                <Tooltip title="共有中">
                  <Button
                    type="text"
                    icon={<LinkOutlined />}
                    // TODO:ダークモードが解ける
                    onClick={() =>
                      modal.info(
                        ShareConfirm(
                          "リストを共有しています",
                          shoppingList?.list_key!,
                          shoppingList?.name!
                        )
                      )
                    }
                  ></Button>
                </Tooltip>
              ) : null}
              </span>
              
            </>
          )}
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
      <FavoriteItemMenu></FavoriteItemMenu>
    </>
  );
};
export default MyHeader;
