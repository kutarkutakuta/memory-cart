import useMenuStore from "@/stores/useMenuStore";
import { Button, Divider, Drawer, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { useEffect, useRef, useState } from "react";

import useSearchStore from "@/stores/useSearchStore";
import router from "next/router";

export function SearchMenu() {
  // メニュー制御用Hook
  const { openFlag, closeMenu } = useMenuStore();

  // マスター用Hook
  const { searchText, searchResults, search } = useSearchStore();

  // フォーカス制御用Ref
  const inputRef = useRef<any | null>(null);

  useEffect(() => {
    if (openFlag["SearchMenu"]) {
      // setInputValue("");
      // search("");
      setTimeout(() => {
        inputRef.current.focus();
      }, 500);
    }
  }, [openFlag["SearchMenu"]]);

  const handleInputChange = (text: string) => {
    search(text);
  };

  return (
    <>
      <Drawer
        title={
          <>
            <SearchOutlined />
            <span style={{ paddingLeft: 4 }}>品物検索</span>
          </>
        }
        placement={"left"}
        open={openFlag["SearchMenu"]}
        onClose={() => closeMenu("SearchMenu")}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="品物名"
          prefix={<SearchOutlined />}
          maxLength={20}
          allowClear
          style={{
            width: "100%",
          }}
          value={searchText}
          onChange={(e) => handleInputChange(e.target.value)}
        />

        <Divider></Divider>
        {!searchResults ? null : (
          <>
            {searchResults.map((result) => {
              return (
                <>
                  <Button
                    type="text"
                    onClick={() => {
                      router.push(
                        `/kaimono?key=${result.shoppingList.list_key}`
                      );
                      closeMenu("SearchMenu");
                    }}
                  >
                    {result.shoppingList.name} →
                  </Button>
                  <table style={{ width: "100%" }}>
                    <tbody>
                      {result.shoppingItems.map((item) => {
                        return (
                          <tr key={item.item_key}>
                            <td style={{ width: "auto", paddingLeft: 25 }}>
                              {item.name}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              );
            })}
          </>
        )}

        <Divider></Divider>

        <Button
          style={{ width: "100%" }}
          onClick={() => closeMenu("SearchMenu")}
        >
          Close
        </Button>
      </Drawer>
    </>
  );
}
