import "@/styles/globals.scss";
import type { AppProps } from "next/app";

import { ConfigProvider, type ThemeConfig, theme } from "antd";
import { useEffect, useState } from "react";
import useMasterStore from "@/stores/useMasterStore";

const mytheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontSize: 16,
    colorLink: "#00FFFF",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  const { appSetting } = useMasterStore();
  const [themeData, setThemeData] = useState<ThemeConfig>(mytheme);

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    // キャッシュからスタイル情報を読み込む
    const themeName = localStorage.getItem('themeName');
    const fontSize = localStorage.getItem('fontSize');
    if (themeName && fontSize) {
      setStyle(themeName, Number(fontSize));
    }
  }, []);

  useEffect(() => {
    
    if (appSetting) {
      // 初回レンダリング時はキャッシュを使用するので無視
      if(!isFirstRender) setStyle(appSetting.theme, appSetting.font_size)
      setIsFirstRender(false);
      localStorage.setItem('themeName',appSetting.theme)
      localStorage.setItem('fontSize', appSetting.font_size.toString())
    }
  }, [appSetting]);

  const setStyle = (themeName: string, fontSize:number) =>{
    document.documentElement.setAttribute("theme", themeName);

      let colorPrimary = "#1890ff";
      switch (themeName) {
        case "light":
          colorPrimary = "#ffc53d";
          break;
        case "green":
          colorPrimary = "#389e0d";
          break;
        case "modern":
          colorPrimary = "#434343";
          break;
      }

      const newtheme: ThemeConfig = {
        algorithm:
        themeName == "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          fontSize: fontSize,
          colorPrimary: colorPrimary,
        },
      };
      setThemeData(newtheme);
  }
  return (
    <ConfigProvider theme={themeData}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
