import useMenuStore from "@/stores/useMenuStore";
import { Button, Drawer, InputNumber, Select, Space } from "antd";

import { usePriceMenu } from "./usePriceMenu";
import useMasterStore from "@/stores/useMasterStore";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import { useEffect, useRef } from "react";

export function PriceMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedItem, closeMenu } = useMenuStore();


  const inputRef = useRef<any | null>(null);

  // フォーム制御用Hook
  const { formData, initialFormData, handleChange } = usePriceMenu();
  useEffect(() => {
    initialFormData(selectedItem);
    inputRef.current?.focus();
  }, [openFlag["PriceMenu"]]);

  // マスター用Hook
  const { units } = useMasterStore();

  // 品物制御用Hook
  const { loading, error, updateShoppingItems } = useShoppingItemStore();

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

          <Space.Compact>
            <InputNumber
              ref={inputRef}
              inputMode="decimal"
              placeholder="価格"
              prefix="￥"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "150px" }}
              value={(formData.buying_price || "").toString()}
              onChange={(e) => handleChange("buying_price", e)}
              maxLength={8}
            />
          </Space.Compact>
          <Space.Compact>
            <InputNumber
              placeholder="数量"
              maxLength={5}
              inputMode="decimal"
              value={formData.buying_amount}
              onChange={(e) => handleChange("buying_amount", e)}
            />
            <Select
              style={{ width: "100px" }}
              filterOption={false}
              options={units.map((m) => ({ label: m.name, value: m.name }))}
              value={formData.buying_unit}
              onChange={(e) => handleChange("buying_unit", e)}
            ></Select>
          </Space.Compact>
          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={() => {
              updateShoppingItems([selectedItem?.id!], formData).then(() =>
                closeMenu("PriceMenu")
              );
            }}
          >
            更新
          </Button>

          <Button
            style={{ width: "100%" }}
            onClick={() => closeMenu("PriceMenu")}
          >
            キャンセル
          </Button>

          {/* <div>☆価格の履歴☆</div> */}
        </Space>
      </Drawer>
    </>
  );
}
