import { AppSetting } from "@/stores/useMasterStore";
import { useState } from "react";

/**
 * フォーム値定義
 */
interface FormData {
  user_name: string;
  font_size: string;
  theme: string;
  notification: boolean;
}

/**
 * メンバ設定用フック
 * @returns
 */
export function useSettingMenu() {
  // フォーム値保存用フック
  const [formData, setFormData] = useState<FormData>({
    user_name: "",
    font_size: "",
    theme: "",
    notification: false,
  });

  /**
   * フォーム値初期化
   * @param shoppingList
   */
  const initialFormData = (appSetting: AppSetting | null) => {

    let newformData: FormData = {
      user_name: "",
      font_size: "",
      theme: "",
      notification: false,
    };

    if(appSetting){
      newformData = {
        user_name: appSetting.user_name!,
        font_size: appSetting.font_size!,
        theme: appSetting.theme!,
        notification: appSetting.notification!,
      }
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
