'use client';
import useShoppingItemStore from "@/stores/useShoppingItemStore";
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
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Input,
  MenuProps,
  Popover,
  Row,
  Space,
  Spin,
} from "antd";
import {
  PlusCircleOutlined,
  BorderOutlined,
  DeleteOutlined,
  DeleteFilled,
  MenuOutlined,
  CheckSquareOutlined,
  FilterOutlined,
  DatabaseOutlined,
  OrderedListOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent, MouseEventHandler, PointerEvent } from "react";
import ShoppingCard from "../ShoppingCard/ShoppingCard";
import useMenuStore from "@/stores/useMenuStore";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { ShoppingList } from "@/stores/useShoppingListStore";

const sortItems: MenuProps["items"] = [
  {
    key: "2",
    label: (
      <>
        <OrderedListOutlined />
        登録順
      </>
    ),
  },
  {
    key: "3",
    label: (
      <>
        <SortAscendingOutlined />
        アイウエオ順
      </>
    ),
  },
  {
    key: "1",
    label: (
      <>
        <DatabaseOutlined />
        カテゴリー順
      </>
    ),
  },
  {
    type: "divider",
  },
  {
    key: "0",
    label: (
      <>
        <Checkbox />
        買い物済と分けない
      </>
    ),
  },
];

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
  shoppingList?: ShoppingList;
}

const ShoppingBox = ({ shoppingList }: ShoppingListProps) => {
  // useSensor と useSensors を使って上書きした Sensor を DndContext に紐付ける
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    shoppingItems,
    loading,
    sortShoppingItem,
    fetchShoppingItems,
    clearShoppingItems,
    updateShoppingItem,
    removeShoppingItem,
    startPolling,
  } = useShoppingItemStore();

  useEffect(() => {
    if (shoppingList) {
      fetchShoppingItems(shoppingList.list_key);

      // // 共有の場合だけポーリングでDBと同期
      // if(shoppingList.isShare){
      //   startPolling(shoppingList.list_key);
      // }
      
    }
    // ページを離れる際のクリーンアップ
    return () => {
      clearShoppingItems(); // データを初期化
    };
  }, [shoppingList]);

  const handleDragEnd = useCallback(
    (event: { active: any; over: any }) => {
      const { active, over } = event;
      if (over === null) {
        return;
      }
      if (active.id !== over.id) {
        const oldIndex = shoppingItems
          .map((item) => {
            return item.id;
          })
          .indexOf(active.id);
        const newIndex = shoppingItems
          .map((item) => {
            return item.id;
          })
          .indexOf(over.id);
        sortShoppingItem(oldIndex, newIndex);
      }
    },
    [shoppingItems, sortShoppingItem]
  );

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  const menuItems: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <>
          <BorderOutlined />
          全て買い物前に戻す
        </>
      ),
      onClick : ()=>{
        shoppingItems.forEach(item=>updateShoppingItem(item.id!,  {finished_at: null}));
      }
    },
    {
      key: "1",
      label: (
        <>
          <CheckSquareOutlined />
          全て買い物済にする
        </>
      ),
      onClick : ()=>{
        shoppingItems.forEach(item=>updateShoppingItem(item.id!,  {finished_at: new Date()}));
      }
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: (
        <>
          <DeleteOutlined />
          買い物済を全て削除
        </>
      ),
      onClick : ()=>{
        shoppingItems.filter(item=>item.finished_at != null).forEach(item=>removeShoppingItem(item.id!));
      }
    },
    {
      key: "3",
      label: (
        <>
          <DeleteFilled />
          全て削除
        </>
      ),
      onClick : ()=>{
        shoppingItems.forEach(item=>removeShoppingItem(item.id!));
      }
    },
  ];


  return (
    <div style={{ maxWidth: "500px" }}>
      <Row justify="space-between" wrap={false} className="sub-header">
        <Col flex="auto">
          <Row justify="start">
            <Col>
              <Button
                type="text"
                icon={<PlusCircleOutlined />}
                onClick={() => openMenu("AddItemMenu", shoppingList)}
              >
                品物を追加
              </Button>
            </Col>
          </Row>
        </Col>
        <Col flex="noen">
          <Row justify="end">
            <Col>
              <Space>
                <Dropdown menu={{ items: sortItems }} placement="bottomRight">
                  <Button type="text" icon={<FilterOutlined />}></Button>
                </Dropdown>
                <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                  <Button type="text" icon={<MenuOutlined />}></Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
      <Spin spinning={loading} style={{ margin: "100px" }}>
        <DndContext
          onDragEnd={handleDragEnd}
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={shoppingItems.map((m) => m.id!)}
            strategy={rectSortingStrategy}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                touchAction: "none",
                paddingLeft: "5px",
              }}
            >
              {shoppingItems.map((item) => (
                <ShoppingCard key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Spin>
    </div>
  );
};
export default ShoppingBox;
