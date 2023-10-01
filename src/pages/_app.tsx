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
  const [data, setData] = useState<ThemeConfig>(mytheme);

  useEffect(() => {
    if (appSetting) {
      document.documentElement.setAttribute("theme", appSetting.theme);

      let colorPrimary = "#1890ff";
      switch (appSetting?.theme) {
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
          appSetting?.theme == "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          fontSize: appSetting?.font_size,
          colorPrimary: colorPrimary,
        },
      };
      setData(newtheme);
    }
  }, [appSetting]);

  return (
    <ConfigProvider theme={data}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
