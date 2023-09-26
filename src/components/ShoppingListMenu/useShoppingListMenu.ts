import useShoppingListStore, {
  ShoppingList,
} from "@/stores/useShoppingListStore";
import { useState } from "react";

/**
 * フォーム値定義
 */
interface FormData {
  id: number;
  name: string;
  memo: string;
  isShare: boolean;
}

/**
 * メンバ設定用フック
 * @returns
 */
export function useShoppingListMenu() {
  // フォーム値保存用フック
  const [formData, setFormData] = useState<FormData>({
    id: -1,
    name: "",
    memo: "",
    isShare: false,
  });

  /**
   * フォーム値初期化
   * @param shoppingList
   */
  const initialFormData = (shoppingList: ShoppingList | null) => {
    const newformData: FormData = {
      id: -1,
      name: "",
      memo: "",
      isShare: false,
    };

    if (shoppingList) {
      newformData.id = shoppingList.id!;
      newformData.name = shoppingList.name!;
      newformData.memo = shoppingList.memo!;
      newformData.isShare = shoppingList.isShare!;
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
