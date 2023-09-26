"use client";
import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tag,
} from "antd";
const {TextArea} = Input;
import {
  MoneyCollectOutlined,
  LinkOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import styles from "./PriceMenu.module.scss";
import useMasterStore from "@/stores/useMasterStore";

export function PriceMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedItem, closeMenu } = useMenuStore();

  // マスター用Hook
  const { categories, commonItems } = useMasterStore();

  const getCategoryOption = () => {
    return categories.map((m) => ({ label: m.name, value: m.name }));
  };

  const handleCategoryChange = (value: string) => {
    // setCategoryName(value);
    // setViewCount(20);
  };
  const { Option } = Select;
  return (
    <>
      <Drawer
        title={
          <>
            <span style={{ paddingLeft: 4 }}>{selectedItem?.name}の価格</span>
          </>
        }
        placement={"left"}
        width={330}
        open={openFlag["PriceMenu"]}
        onClose={() => closeMenu("PriceMenu")}
      >
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Space.Compact block>
            <InputNumber placeholder="数量" style={{ width: "200px" }} />
            <Select defaultValue="" style={{ width: 100 }} filterOption={false}>
              <Option value="個">個</Option>
              <Option value="g">g</Option>
              <Option value="kg">kg</Option>
            </Select>
          </Space.Compact>
          <Space.Compact>
            <InputNumber
              placeholder="価格"
              prefix="￥"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\s?|(,*)/g, "")}
              style={{ width: "200px" }}
            />

          </Space.Compact>

          <Button type="primary" style={{ width: "100%" }}>更新</Button>
          
          <Button
            style={{ width: "100%" }}
            onClick={() => closeMenu("PriceMenu")}
          >
            キャンセル
          </Button>

          <div>☆価格の履歴☆</div>

        </Space>
      </Drawer>
    </>
  );
}
