import React, { useEffect } from "react";
import {
  TwitterOutlined,
  PlusCircleOutlined,
  EditOutlined,
  FormOutlined,
  LinkOutlined,
  CopyOutlined,
  DisconnectOutlined,
  DeleteFilled,
  DeleteOutlined,
  HeartOutlined,
  UserOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import MyHeader from "@/components/MyHeader";
import { Divider } from "antd";
import MyFoorter from "@/components/MyFooter";

const Help = () => {
  return (
    <>
      <header>
        <MyHeader></MyHeader>
      </header>
      <main>
        <h3>■データの取扱いについて</h3>
        <div style={{ paddingLeft: "20px" }}>
          <ol>
            <li style={{ listStyleType: "disc" }}>
              通常のデータはユーザーのブラウザ内に保存されます。 <br />
              <div style={{ color: "#cf1322" }}>
                ※ブラウザの履歴閲覧データを削除すると、Cookieなどと同様にデータが削除されることがあります。
              </div>
            </li>
            <li style={{ listStyleType: "disc" }}>
              共有したデータはサーバー上に保存されます。 <br />
              共有URLを指定することでサーバー上のデータと同期するので、バックアップのように使用することもできます。
            </li>
          </ol>
        </div>
        <Divider />
        <h3>■使い方</h3>
        <div style={{ paddingLeft: "20px" }}>
          <ol>
            <li style={{ fontWeight: "bold",paddingTop:5 }}>
              買い物リストの追加/編集/削除
              <ol>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［<PlusCircleOutlined />
                  買い物リストを追加］買い物リストを追加します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <FormOutlined />
                  名前の変更］買い物リストの名前変更やメモを追加します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <CopyOutlined />
                  コピー］買い物リストに紐づいた品物も含めてコピーした新しい買い物リストを追加します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <DeleteFilled />
                  削除］買い物リストに紐づいた品物も含めて削除します。
                  <br />
                  <div style={{ color: "#cf1322" }}>
                    ※共有は解除されないので、サーバー上の共有データも削除したい場合は先に共有を解除してください。
                  </div>
                </li>
              </ol>
            </li>
            <li style={{ fontWeight: "bold",paddingTop:5 }}>
              共有/共有解除
              <ol>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <LinkOutlined />
                  共有する］買い物リストを共有します。
                  共有した買い物リストはサーバーに登録されて共有URLが発行されます。共有したい相手にこの共有URLを送ります。
                  <br /> 共有URLへアクセスすると自動的に買い物リストが作成されます。
                  <br />
                  共有中の買い物リストはオフラインだと参照のみ可能で編集できません。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <DisconnectOutlined />
                  共有を解除］買い物リストの共有を解除します。
                  共有を解除するとサーバー上のデータが削除されて、全ての共有相手の共有が解除されます。
                  <br />
                  <div style={{ color: "#cf1322" }}>
                    ※共有解除後もクライアントにあるデータをそのまま使用できます。
                  </div>
                  <div style={{ color: "#cf1322" }}>
                    ※共有解除後に再び買い物リストを共有すると共有URLが新しく発行されるので、再度共有相手に共有URLを送ってください。
                  </div>
                </li>
              </ol>
            </li>
            <li style={{ fontWeight: "bold",paddingTop:5 }}>
              品物の追加/編集/削除
              <ol>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <PlusCircleOutlined />
                  品物を追加］品物を追加します。
                  <span style={{ color: "#cf1322" }}>
                    音声認識による入力が可能です。
                  </span>
                  「一般的な品物から探す」「お気に入りから探す」から品物を選ぶこともできます。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <EditOutlined />
                  品物の編集］品物の「品物名」「カテゴリ」「数量」「優先度」「メモ」を編集します。
                  <div style={{ color: "#cf1322" }}>
                    ※[
                    <HeartOutlined />
                    ]ボタンで「お気に入り品」に登録できます。
                  </div>
                  <div style={{ color: "#cf1322" }}>
                    ※ネットスーパーを「品物名」で検索できます。 <br />
                    （Amazon Fresh, Amazon ライフ, 楽天西友, イトーヨーカドー
                    に対応）
                  </div>
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <CopyOutlined />
                  コピー］コピー先の買い物リストを指定して品物をコピーします。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <DeleteOutlined />
                  削除］品物を削除します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［￥金額を入力］品物の金額を入力します。履歴に登録されるので過去の金額と比較できます。
                </li>
              </ol>
            </li>
            <li style={{ fontWeight: "bold",paddingTop:5 }}>
              その他設定等
              <ol>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <SearchOutlined />
                  品物検索］登録済みの品物を検索して、登録されているリスト名を表示します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <UserOutlined />
                  ユーザー設定］「ユーザー名」「フォントサイズ」「テーマカラー」を設定します。
                </li>
                <li style={{ fontWeight: "normal", listStyleType: "disc" }}>
                  ［
                  <HeartOutlined />
                  お気に入り品の登録］お気に入り品に登録すると「品物を追加」するときにお気に入りから品物を追加できるようになります。
                </li>
              </ol>
            </li>
          </ol>
        </div>

        <Divider />
        <p>更新情報やお問い合わせはこちら</p>
        <a href="https://twitter.com/kutakutar_ff11" target="_blank">
          <TwitterOutlined />
          kutakutar_ff11
        </a>
      </main>
      <footer>
        <MyFoorter></MyFoorter>
      </footer>
    </>
  );
};

export default Help;
