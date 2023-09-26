"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button, Col, Dropdown, MenuProps, Row, Space } from "antd";
import {
  UserAddOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";

const MyHeader = ({ title }: { title: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Row justify="space-between" align="middle">
      <Col flex="none">
        <Row justify="start">
          <Col>
            {pathname == "/" ? (
              <span style={{padding:10}}>{title}</span>
            ) : (
              <>
                <Button type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                ></Button> <span>{title}</span>
                
              </>
            )}
          </Col>
        </Row>
      </Col>
      <Col flex="auto">
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
