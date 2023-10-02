import React, { useEffect } from "react";
import {
  TwitterOutlined,
  PlusCircleOutlined,
  EditOutlined,
  FormOutlined,
  LinkOutlined,
  FolderAddOutlined,
  DisconnectOutlined,
  DeleteFilled,
  DeleteOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MyHeader from "@/components/MyHeader";
import { Divider } from "antd";

const HomePage = () => {
  return (
    <>
      <header>
        <MyHeader></MyHeader>
      </header>
      <main>
        <h3>1.リストの追加/編集/削除</h3>
        ・［
        <PlusCircleOutlined />
        リストを追加］リストを追加します。
        <br />
        ・［
        <FormOutlined />
        リストの編集］リスト名の変更やメモを追加します。
        <br />
        ・［
        <DeleteFilled />
        リストの削除］リストに紐づいた品物も含めて削除します。
        <br />※共有は解除されないので、サーバー上の共有データも削除したい場合は先に共有解除をする必要があります。
        <Divider />
        <h3>2.リストのコピー</h3>
        ・［
        <FolderAddOutlined />
        コピーしてリストを追加］リストに紐づいた品物も含めてコピーした新しいリストを追加します。
        <Divider />
        <h3>3.リストの共有</h3>
        ・［
        <LinkOutlined />
        リストを共有する］リストを共有します。
        共有したリストはサーバーに登録されて共有URLが発行されるので、共有相手に共有URLを送ります。
        <br /> 共有URLへアクセスすると自動的にリストが作成されます。
        <br /> ※品物の追加/変更/削除は自動的に同期されますが、並び順は同期されません。
        <br /> ※共有リストはオフラインだと参照はできますが編集はできません。
        <Divider />
        <h3>4.リストの共有解除</h3>
        ・［
        <DisconnectOutlined />
        リストの共有を解除］リストの共有を解除します。
        共有を解除するとサーバー上のデータが削除されて、全ての共有相手の共有が解除されます。
        <br />
        ※共有解除後もそのまま使用することはできます。
        <br/>
        ※共有解除後に再びリストを共有すると共有URLが新しく発行されるので、再度共有相手に共有URLを送って下さい。
        <Divider />
        <h3>5.品物の追加/編集/削除</h3>
        ・［
        <PlusCircleOutlined />
        品物を追加］品物を追加します。複数入力が可能で、手入力の他に「一般的な品物から探す」「お気に入りから探す」から品物を選ぶこともできます。
        <br />
        ・［
        <EditOutlined />
        品物の編集］品物の「品物名」「カテゴリ」「数量」「優先度」「メモ」を編集します。
        <br />
        ※「お気に入り品」に登録することもできます。
        <br />
        ・［
        <DeleteOutlined />
        品物の削除］品物を削除します。
        <Divider />
        <h3>6.金額の入力</h3>
        ・［￥　金額を入力］品物の金額を入力します。履歴に登録されるので過去の金額と比較できます。
        <Divider />
        <h3>7.ユーザー設定</h3>
        ・［<UserOutlined />ユーザー設定］「ユーザー名」「フォントサイズ」「テーマカラー」を設定します。
        <Divider />
        <h3>8.お気に入り品</h3>
        <p>
          ・［<HeartOutlined />お気に入り品の登録］お気に入り品に登録すると「品物を追加」するときにお気に入りから品物を追加できるようになります。
        </p>
        <Divider />
        <p>更新情報やお問い合わせはこちら</p>
        <a href="https://twitter.com/kutakutar_ff11" target="_blank">
          <TwitterOutlined />
          kutakutar_ff11
        </a>
      </main>
    </>
  );
};

export default HomePage;
