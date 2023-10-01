import React from "react";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import Document, { Head, Html, Main, NextScript } from "next/document";
import type { DocumentContext } from "next/document";

const MyDocument = () => (
  <Html lang="ja">
    <Head>
      <meta title="Memory Cart"></meta>
      <meta
        name="description"
        content="買い物リストをメモしたり共有したり。面倒な登録は一切不要ですぐ使えます。"
      />
      {/* <!-- Facebook:カード用--> */}
      <meta property="og:url" content="https://okaimono.onrender.com" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Memory Cart" />
      <meta
        property="og:description"
        content="買い物リストをメモしたり共有したり。面倒な登録は一切不要ですぐ使えます。"
      />
      <meta
        property="og:image"
        content="https://renkei-navi.onrender.com/assets/icons/icon-128x128.png"
      />
      {/* <!-- twitter:カード用--> */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@kutakutar_ff11" />
      <meta name="twitter:domain" content="okaimono.onrender.com" />
      <meta name="twitter:url" content="https://okaimono.onrender.com" />
      <meta name="twitter:title" content="Memory Cart" />
      <meta
        name="twitter:description"
        content="買い物リストをメモしたり共有したり。面倒な登録は一切不要ですぐ使えます。"
      />
      <meta
        name="twitter:image"
        content="https://okaimono.onrender.com/assets/icons/icon-128x128.png"
      />

      <meta
        name="google-site-verification"
        content="eKWsAU6fruzFLUVXCaNJ1VF4-8tcVAZrHDUYUNmsGOE"
      />
      <link
        rel="icon"
        type="image/png"
        href="assets/icons/icon-16x16.png"
        sizes="16x16"
      />
      <link
        rel="icon"
        type="image/png"
        href="assets/icons/icon-32x32.png"
        sizes="32x32"
      />
      <link
        rel="icon"
        type="image/png"
        href="assets/icons/icon-48x48.png"
        sizes="48x48"
      />
      <link
        rel="icon"
        type="image/png"
        href="assets/icons/icon-64x64.png"
        sizes="64x64"
      />
      <link
        rel="icon"
        type="image/png"
        href="assets/icons/icon-128x128.png"
        sizes="128x128"
      />
      <link rel="apple-touch-icon" href="assets/icons/icon-128x128.png" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&amp;display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <link rel="manifest" href="manifest.webmanifest" />
      <meta name="theme-color" content="#1976d2" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) =>
        (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default MyDocument;
