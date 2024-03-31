import { useRouter } from "next/router";
import { Button, Col, Row } from "antd";
import { HomeOutlined, SearchOutlined, HeartOutlined, SettingOutlined } from "@ant-design/icons";
import useMenuStore from "@/stores/useMenuStore";
const MyFoorter = () => {
  
  const router = useRouter();
  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  return (
    <>
      <Row wrap={false} gutter={20} justify="space-evenly">
        <Col>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => router.push("/")}
          ></Button>
        </Col>
        <Col>
          <Button
            type="text"
            icon={<SearchOutlined />}
            onClick={() => openMenu("SearchMenu")}
          ></Button>
        </Col>
        <Col>
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={() => openMenu("FavoriteItemMenu")}
          ></Button>
        </Col>
        <Col>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => openMenu("SettingMenu")}
          ></Button>
        </Col>
      </Row>
    </>
  );
};
export default MyFoorter;
