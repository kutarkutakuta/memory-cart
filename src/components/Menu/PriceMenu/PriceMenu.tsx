import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  InputNumber,
  List,
  Select,
  Space,
} from "antd";

import { usePriceMenu } from "./usePriceMenu";
import useMasterStore from "@/stores/useMasterStore";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import { useEffect, useRef } from "react";
import usePriceHistoryStore from "@/stores/usePriceHistoryStore";

export function PriceMenu() {
  // マスター用Hook
  const { units } = useMasterStore();
  // 品物制御用Hook
  const { updateShoppingItems } = useShoppingItemStore();
  // 品物制御用Hook
  const { upsertPriceHistory, fetchPriceHistories, priceHistories } =
    usePriceHistoryStore();
  // メニュー制御用Hook
  const { openFlag, selectedItem, closeMenu } = useMenuStore();
  // フォーカス制御用Ref
  const inputRef = useRef<any | null>(null);
  // フォーム制御用Hook
  const { formData, initialFormData, handleChange } = usePriceMenu();
  useEffect(() => {
    initialFormData(selectedItem);
    if (selectedItem) {
      fetchPriceHistories(selectedItem.category_name!, selectedItem.name);
      inputRef.current?.focus();
    }
  }, [openFlag["PriceMenu"]]);

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
        <Space direction="vertical" size="small" style={{ display: "flex" }}>
          <Space.Compact>
            <InputNumber
              ref = {inputRef} 
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
              upsertPriceHistory(selectedItem!);
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
          <Divider />
          {priceHistories.length ? (
            <>
              ☆価格履歴☆
              <table style={{ width: "100%" }}>
                {priceHistories.map((item) => {
                  return (
                    <>
                      <tr>
                        <td style={{ width: "90px"}}>
                          {item.updated_at.toLocaleDateString()}　
                          {/* [{item.updated_user}] */}
                        </td>
                        <td style={{ width: "auto" }}>
                          ￥ {item.price.toLocaleString()}
                          {item.amount
                            ? " (" +
                              item.amount.toLocaleString() +
                              item.unit +
                              ")"
                            : null}
                        </td>
                      </tr>
                    </>
                  );
                })}
              </table>
            </>
          ) : (
            ""
          )}
        </Space>
      </Drawer>
    </>
  );
}
