"use client";
import React from "react";
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
  Typography,
} from "antd";
import {
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Paragraph } = Typography;

const MyHeader = ({ title, isShare }: { title: string; isShare: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
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
  return (
    <Row justify="space-between" wrap={false}>
      <Col flex="auto">
        <Row justify="start">
          <Col>
            <Paragraph ellipsis={true}>
              {pathname == "/" ? (
                <span style={{ padding: 10 }}>{title}</span>
              ) : (
                <>
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => handleGoBack()}
                  ></Button>{" "}
                  <Space>
                    <span>{title}</span>
                    {isShare ? (
                      <Tag icon={<LinkOutlined />} color="#00A000"></Tag>
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
              <Button type="text" icon={<QuestionCircleOutlined />}></Button>
              <Button type="text" icon={<UserOutlined />}></Button>
            </Space>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default MyHeader;
