import { ShoppingItem } from "@/stores/useShoppingItemStore";
import { useState } from "react";

/**
 * フォーム値定義
 */
interface FormData {
  name: string;
  category_name?: string;
  amount?: number;
  unit?: string;
  priority?: string;
  memo?: string;
}

/**
 * フォーム用フック
 * @returns
 */
export function useEditItemMenu() {
  // フォーム値保存用フック
  const [formData, setFormData] = useState<FormData>({
    name: "",
    memo: "",
  });

  /**
   * フォーム値初期化
   * @param shoppingList
   */
  const initialFormData = (shoppingItem: ShoppingItem | null) => {
    const newformData: FormData = {
      name: "",
    };

    if (shoppingItem) {
      newformData.name = shoppingItem.name!;
      newformData.category_name = shoppingItem.category_name!;
      newformData.amount = shoppingItem.amount!;
      newformData.unit = shoppingItem.unit!;
      newformData.priority = shoppingItem.priority!;
      newformData.memo = shoppingItem.memo!;
    }

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
