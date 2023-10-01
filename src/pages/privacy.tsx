import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";

const HomePage = () => {
  return (
    <>
      <header>
        <MyHeader></MyHeader>
      </header>
      <main>
        <h3>アプリケーションのプライバシーポリシー</h3>
        <div>このアプリケーションは、個人情報を収集したり公開しません。</div>
        <br/>
        <hr />
        <br/>
        <h3>Application privacy policy</h3>
        <div>
          This application does not collect or publish any personal information.
        </div>
      </main>
    </>
  );
};

export default HomePage;
