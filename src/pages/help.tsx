import React, { useEffect } from "react";

import { TwitterOutlined } from "@ant-design/icons";

import MyHeader from "@/components/MyHeader";

import { Divider } from "antd";

const HomePage = () => {

  return (
    <>
      <header>
        <MyHeader></MyHeader>
      </header>
      <main>
      <h3>
        1.リストの追加/編集
      </h3>
      <p>
        ・「リストを追加」からリストを追加後に「リストの編集」から編集を行います。
      </p>
      <p>・「コピーしてリストを追加」を選ぶと、選んだ買物リストに紐づいた品物を含めてコピーした新しい買い物リストを追加します。</p>
      <Divider />
      <h3>
        2.リストの共有
      </h3>
      <p>
        ・共有したリストはサーバーに登録されて、共有URLアドレスを知っているユーザー同士で共有できます。
      </p>
      <p>・共有URLへアクセスすると自動的に買い物リストが作成されます。</p>
      <Divider />
      <h3>
        3.リストの共有解除
      </h3>
      <p>
      ・共有を解除するとサーバー上のデータが削除されて、共有していた全てのユーザーの共有が解除されます。
      </p>
      <p>
      ・共有解除後もそのままローカルで使えます。
      </p>
      <p>
      ・共有解除後に再び共有すると共有URLが新しく発行されるので、共有したいユーザーに新しい共有URLを送って下さい。
      </p>
      <p>
      ・自分以外のユーザーに共有解除されたリストは自動的に共有解除されます。
      </p>
      <Divider />
      <h3>
        4.リストの削除
      </h3>
      <p>
      ・リストを削除するとそれに紐づく品物もすべて削除されます。
      </p>
      <p>
      ・共有は解除されないので、サーバー上の共有データも削除したい場合は先に共有解除をする必要があります。
      </p>
      <Divider />
      <h3>
        5.お気に入り品
      </h3>
      <p>
      ・お気に入り品に登録すると「品物を追加」するときにお気に入りから品物を追加できるようになります。
      </p>
      
      <Divider />
      <p >更新情報やお問い合わせはこちら</p>
      <a href="https://twitter.com/kutakutar_ff11" target="_blank">
      <TwitterOutlined />kutakutar_ff11
      </a>
      </main>
    </>
  );
};

export default HomePage;
