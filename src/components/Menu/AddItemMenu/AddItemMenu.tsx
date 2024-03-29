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
import { AudioOutlined, AudioTwoTone } from "@ant-design/icons";

import useMasterStore, { CommonItem } from "@/stores/useMasterStore";
import { useEffect, useRef, useState } from "react";
import useShoppingItemStore from "@/stores/useShoppingItemStore";
import useFavoriteItemStore, {
  FavoriteItem,
} from "@/stores/useFavoriteItemStore";

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
  const { shoppingItems, addShoppingItem, updateShoppingItems } = useShoppingItemStore();
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
        const item = shoppingItems.find((m) => m.name == addName);
        if(item){
          const amount = (item.amount ? item.amount : 1) + 1;
          updateShoppingItems([item.id!], {
            amount: amount,
          });
          messageApi.warning(`${addName}が ${amount} に増えました`);
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
  const [transcript, setTranscript] = useState<string>("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.continuous = false;  // 発言の終わりで録音を止めるかどうか
      recognition.interimResults = true;  // 中間の結果を返す
      setRecognition(recognition);
    }
  }, []);
  
  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        setTranscript(results[i][0].transcript);
      }
    };
    recognition.onaudiostart =()=>{
      setIsRecording(true);
    };
    recognition.onaudioend = ()=>{
      setTimeout(() => {
        setTranscript((prev)=>{
          if(prev.length > 0) setAddItems([prev]);
          return "";
        });
      }, 500);
      setIsRecording(false);
    };
    recognition.onerror =(ev)=>{
      console.error(ev);
    };
  }, [recognition]);

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
                icon={isRecording ? <AudioTwoTone twoToneColor="#eb2f96" /> : <AudioOutlined />}
                onClick={() => {
                  isRecording ? recognition?.stop() : recognition?.start();
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
          <Radio.Group onChange={(e) => {
              setViewItemCount(20);
              setSearchMode(e.target.value);
            }} value={searchMode}>
            <Space direction="vertical">
              <Radio value={2}>一般的な品物から探す</Radio>
              <Radio value={1}>お気に入りから探す</Radio>
            </Space>
          </Radio.Group>
          <Divider style={{ margin: 0 }}></Divider>
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
