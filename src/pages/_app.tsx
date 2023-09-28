import "@/styles/globals.scss";
import type { AppProps } from "next/app";

import { ConfigProvider, type ThemeConfig, theme } from "antd";

const mytheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontSize: 16,
    colorLink: "#00FFFF",
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={mytheme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
