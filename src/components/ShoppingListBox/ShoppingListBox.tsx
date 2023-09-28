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
import { Button, Col, Input, Popover, Row, Space } from "antd";
import { PlusCircleOutlined, LinkOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent, MouseEventHandler, PointerEvent } from "react";
import useShoppingListStore from "@/stores/useShoppingListStore";
import ShoppingListCard from "../ShoppingListCard/ShoppingListCard";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import useShareStore from "@/stores/useShareStore";

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

interface ShoppingListProps {
  list_id: string;
}

const ShoppingListBox = () => {
  // useSensor と useSensors を使って上書きした Sensor を DndContext に紐付ける
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    shoppingLists,
    sortShoppingList,
    addShoppingList,
    fetchShoppingList,
  } = useShoppingListStore();
  useEffect(() => {
    fetchShoppingList();
  }, []);

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

  const addItem = () => {
    addShoppingList();
  };

  const [openShareKey, setOpenShareKey] = useState(false);
  const [shareKey, setShareKey] = useState("");
  const {addFromShareKey} = useShareStore()

  return (
    <div style={{ maxWidth: "500px" }}>
      <Row justify="space-between" wrap={false} className = "sub-header">
        <Col flex="none">
          <Row justify="start">
            <Col>
              <Button
                type="text"
                icon={<PlusCircleOutlined />}
                onClick={addItem}
              >
                リストを追加
              </Button>
              <Popover
                open={openShareKey}
                onOpenChange={e=>setOpenShareKey(e)}
                title="共有キーを入力してください"
                content={
                  <>
                  <Space.Compact>
                    <Input value={shareKey} onChange={e=>setShareKey(e.target.value)}></Input>
                    <Button onClick={()=>addFromShareKey(shareKey)}>OK</Button>
                    </Space.Compact>
                    <a onClick={()=>setOpenShareKey(false)}>Cancel</a>
                  </>
                }
                trigger="hover"
              >
                <Button type="text" icon={<LinkOutlined />}>
                  共有キーから追加
                </Button>
              </Popover>
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
              paddingLeft: "5px",
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
