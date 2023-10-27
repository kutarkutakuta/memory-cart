import useMenuStore from "@/stores/useMenuStore";
import {
  Button,
  Divider,
  Drawer,
  Radio,
  Select,
  SelectProps,
  Space,
  Tag,
  message,
} from "antd";
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons";

import useMasterStore, { Category, CommonItem } from "@/stores/useMasterStore";
import { useEffect, useRef, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useFavoriteItemStore, {
  FavoriteItem,
} from "@/stores/useFavoriteItemStore";
import { useTimer } from "react-timer-hook";

export function AddItemMenu() {
  // メニュー制御用Hook
  const { openFlag, selectedList, closeMenu } = useMenuStore();
  // マスター用Hook
  const { categories, commonItems } = useMasterStore();
  // お気に入り品用Hook
  const { favoriteItems } = useFavoriteItemStore();
  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  // 品物用Hook
  const { shoppingItems, addShoppingItem } = useShoppingItemStore();
  // フォーカス制御用Ref
  const inputRef = useRef<any | null>(null);
  // 初期化
  useEffect(() => {
    if (selectedList) {
      setListKey(selectedList.list_key);
      setAddItems([]);
      setCategoryName(null);
      setViewItemCount(25);
      setTimeout(() => {
        inputRef.current.focus();
      }, 500);
    }
  }, [openFlag["AddItemMenu"]]);

  const [list_key, setListKey] = useState<string | null>(null);
  const [addItems, setAddItems] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  const [viewItemCount, setViewItemCount] = useState<number>(25);
  const [viewCommons, setViewCommons] = useState<CommonItem[]>(commonItems);
  const [viewFavorites, setViewFavorites] = useState<FavoriteItem[]>([]);
  const [searchMode, setSearchMode] = useState(2);

  useEffect(() => {
    if (searchMode === 1) {
      let items: FavoriteItem[] = favoriteItems;
      if (categoryName != null) {
        items = favoriteItems.filter((m) => {
          return m.category_name == categoryName;
        });
      }
      setItemCount(items.length);
      setViewFavorites(items.filter((_m, i) => i < viewItemCount));
    } else {
      let newItems = commonItems;
      if (categoryName != null) {
        newItems = commonItems.filter((m) => {
          return m.category_name == categoryName;
        });
      }
      setItemCount(newItems.length);
      setViewCommons(newItems.filter((_m, i) => i < viewItemCount));
    }
  }, [commonItems, favoriteItems, searchMode, categoryName, viewItemCount]);

  useEffect(() => {
    if (addItems.length > 0) {
      addItems.forEach((addName) => {
        if (shoppingItems.findIndex((m) => m.name == addName) > -1) {
          messageApi.warning(`${addName}は追加済みです`);
        } else {
          addShoppingItem(list_key!, addName);
          messageApi.success(`${addName}を追加しました`);
        }
      });
      setAddItems([]);
    }
  }, [addItems]);

  // 追加する品物の名前用の項目
  const [itemOptions, setItemOptions] = useState<SelectProps["options"]>([]);

  const handleItemSearch = (newValue: string) => {
    if (newValue.length > 0) {
      const a = commonItems
        .filter((itm) => itm.name?.startsWith(newValue))
        .map((itm) => ({
          value: itm.name!,
          label: itm.name!,
        }));
      const b = favoriteItems
        .filter((itm) => itm.name?.startsWith(newValue))
        .map((itm) => ({
          value: itm.name,
          label: itm.name,
        }));
      setItemOptions(a.concat(b));
    } else {
      setItemOptions([]);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.continuous = true;
      recognition.interimResults = true;
      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;
    if (isRecording) {
      recognition.start();
      // タイマー開始
      const time = new Date();
      time.setSeconds(time.getSeconds() + 2);
      restart(time, true);
    } else {
      if(text.length > 0) setAddItems([text]);
      recognition.stop();
      setText("");
      // タイマー停止
      resume();
    }
  }, [isRecording]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (results[i].isFinal) {
          setText((prevText) => prevText + results[i][0].transcript);
          setTranscript("");
          // タイマー再開
          const time = new Date();
          time.setSeconds(time.getSeconds() + 0.5);
          restart(time, true);
        } else {
          setTranscript(results[i][0].transcript);
          // タイマー再開
          const time = new Date();
          time.setSeconds(time.getSeconds() + 1);
          restart(time, true);
        }
      }
    };
  }, [recognition]);

  const {
    seconds,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: new Date(),
    onExpire: () => {
      setIsRecording(false);
    },
  });
  
  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <>
            <Space.Compact block>
              <Select
                ref={inputRef}
                mode="tags"
                style={{ width: "100%" }}
                placeholder={transcript || "品物の名前"} 
                value={addItems}
                suffixIcon={null}
                notFoundContent={null}
                onSearch={handleItemSearch}
                options={(itemOptions || []).map((d) => ({
                  value: d.value,
                  label: d.text,
                }))}
                onChange={(e) => setAddItems(e)}
              />
              <Button
                icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={() => {
                  setIsRecording((prev) => !prev);
                }}
              ></Button>
            </Space.Compact>
          </>
        }
        placement={"right"}
        open={openFlag["AddItemMenu"]}
        onClose={() => {
          closeMenu("AddItemMenu");
        }}
      >
        <Space direction="vertical" size="small" style={{ display: "flex" }}>
          {/* <Divider style={{ margin: 0 }}></Divider> */}
          <Select
            style={{ width: "100%" }}
            onChange={(e) => {
              setViewItemCount(20);
              setSearchMode(e);
            }}
            options={[
              { value: 1, label: "お気に入りから探す" },
              { value: 2, label: "一般的な品物から探す" },
            ]}
            value={searchMode}
          />

          <Select
            showSearch
            allowClear
            maxTagCount={50}
            maxLength={500}
            style={{ width: "100%" }}
            placeholder="カテゴリで絞り込み"
            onChange={(e) => {
              setViewItemCount(20);
              setCategoryName(e);
            }}
            options={categories.map((m) => ({ label: m.name, value: m.name }))}
            value={categoryName}
          />
          {searchMode === 1 ? (
            <Space size={[0, 8]} wrap>
              {viewFavorites.length == 0
                ? "お気に入りが登録されていません"
                : ""}
              {viewFavorites.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setAddItems([m.name!])}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
          ) : (
            <Space size={[0, 8]} wrap>
              {viewCommons.length == 0 ? "一般的な品物が見つかりません" : ""}
              {viewCommons.map((m) => (
                <Tag
                  key={m.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setAddItems([m.name!])}
                >
                  {m.name}
                </Tag>
              ))}
            </Space>
          )}

          {itemCount > viewItemCount ? (
            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                size="small"
                onClick={() => setViewItemCount(viewItemCount + 50)}
              >
                <span style={{ fontSize: "small" }}>もっと表示</span>
              </Button>
            </div>
          ) : null}
          <Divider style={{ margin: 0 }}></Divider>

          <Button
            style={{ width: "100%" }}
            onClick={() => {
              closeMenu("AddItemMenu");
            }}
          >
            Close
          </Button>
        </Space>
      </Drawer>
    </>
  );
}
