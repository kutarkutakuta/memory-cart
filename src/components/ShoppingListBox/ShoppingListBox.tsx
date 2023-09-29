"use client";

import {
  DndContext,
  PointerSensor as LibPointerSensor,
  KeyboardSensor as LibKeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Button, Col, Input, Popover, Row, Space, message } from "antd";
import { PlusCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import useShoppingListStore from "@/stores/useShoppingListStore";
import ShoppingListCard from "../ShoppingListCard/ShoppingListCard";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

// #region dnd-kit用の制御
// data-enable-dnd="true" が指定されている要素のみドラッグ可能にする
function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element;
  while (cur) {
    if (cur.dataset && cur.dataset.enableDnd) {
      return true;
    }
    cur = cur.parentElement;
  }
  return false;
}

class PointerSensor extends LibPointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: PointerEvent): boolean => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

// LibKeyboardSensor を override してドラッグ無効にする
class KeyboardSensor extends LibKeyboardSensor {
  static activators = [
    {
      eventName: "onKeyDown" as const,
      handler: ({ nativeEvent: event }: KeyboardEvent<Element>): boolean => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}
// #endregion

const ShoppingListBox = () => {
  // useSensor と useSensors を使って上書きした Sensor を DndContext に紐付ける
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 買い物リスト制御用Hook
  const {
    loading,
    error,
    shoppingLists,
    sortShoppingList,
    addShoppingList,
    fetchShoppingList,
    clearShoppingLists,
  } = useShoppingListStore();
  useEffect(() => {
    fetchShoppingList();
    return ()=> {
      // ページを離れる際のクリーンアップ
      clearShoppingLists();
    }
  }, []);

  // メッセージ用Hook
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (error)
      messageApi.open({
        type: "error",
        content: error?.message,
      });
  }, [error]);

  const handleDragEnd = useCallback(
    (event: { active: any; over: any }) => {
      const { active, over } = event;
      if (over === null) {
        return;
      }
      if (active.id !== over.id) {
        const oldIndex = shoppingLists
          .map((item) => {
            return item.id;
          })
          .indexOf(active.id);
        const newIndex = shoppingLists
          .map((item) => {
            return item.id;
          })
          .indexOf(over.id);
        sortShoppingList(oldIndex, newIndex);
      }
    },
    [shoppingLists, sortShoppingList]
  );

  const [openShareKey, setOpenShareKey] = useState(false);
  const [shareKey, setShareKey] = useState("");

  return (
    <div style={{ maxWidth: "500px" }}>
      {contextHolder}
      <Row justify="space-between" wrap={false} className="sub-header">
        <Col flex="none">
          <Row justify="start">
            <Col>
              <Button
                type="text"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  addShoppingList().then(() =>
                    messageApi.success("リストを追加しました。")
                  );
                }}
              >
                リストを追加
              </Button>
              
            </Col>
          </Row>
        </Col>
        <Col flex="auto">
          <Row justify="end">
            <Col></Col>
          </Row>
        </Col>
      </Row>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={shoppingLists} strategy={rectSortingStrategy}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              userSelect: "none",
            }}
          >
            {shoppingLists.map((item) => (
              <ShoppingListCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
export default ShoppingListBox;
