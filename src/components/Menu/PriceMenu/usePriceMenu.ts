import { ShoppingItem } from "@/stores/useShoppingItemStore";
import { useState } from "react";

/**
 * フォーム値定義
 */
interface FormData {
  buying_amount: number | null;
  buying_unit: string;
  buying_price: number | null;
}

/**
 * メンバ設定用フック
 * @returns
 */
export function usePriceMenu() {
  // フォーム値保存用フック
  const [formData, setFormData] = useState<FormData>({
    buying_amount:null,
    buying_unit: "",
    buying_price: null,
  });

  /**
   * フォーム値初期化
   * @param shoppingList
   */
  const initialFormData = (shoppingItem: ShoppingItem | null) => {
    const newformData: FormData = {
      buying_amount: null,
      buying_unit: "",
      buying_price: null,
    };

    if (shoppingItem) {
      newformData.buying_amount = shoppingItem.buying_amount!;
      newformData.buying_unit = shoppingItem.buying_unit!;
      newformData.buying_price = shoppingItem.buying_price!;
    }shoppingItem

    setFormData(newformData);
  };

  /**
   * 値変更時
   * @param name
   * @param value
   * @param member
   */
  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  return {
    formData,
    initialFormData,
    handleChange,
  };
}
