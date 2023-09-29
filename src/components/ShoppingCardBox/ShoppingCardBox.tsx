"use client";
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
  arrayMove,
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
import useMasterStore from "@/stores/useMasterStore";

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

const ShoppingCardBox = ({ shoppingList }: ShoppingListProps) => {
  // useSensor と useSensors を使って上書きした Sensor を DndContext に紐付ける
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // メニュー制御用Hook
  const { openMenu } = useMenuStore();

  // マスター用Hook
  const { categories } = useMasterStore();

  // 買物品操作用Hook
  const {
    shoppingItems,
    loading,
    sortShoppingItem,
    updateShoppingItems,
    removeShoppingItems,
  } = useShoppingItemStore();

  const [boughtOrder, SetboughtOrder] = useState(true);

  // ドラッグ後の並び替え処理
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
        const newItems = arrayMove(shoppingItems, oldIndex, newIndex);
        sortShoppingItem(newItems);
      }
    },
    [shoppingItems, sortShoppingItem]
  );

  // 並び替え項目
  const sortItems: MenuProps["items"] = [
    {
      key: "1",
      label: "登録順",
      icon: <OrderedListOutlined />,
      onClick: () => {
        const newItems = shoppingItems.sort((a, b) => {
          // 購入済みでソートする場合
          if (boughtOrder) {
            if (a.finished_at && !b.finished_at) {
              return 1;
            } else if (!a.finished_at && b.finished_at) {
              return -1;
            }
          }
          // 登録日でソート
          if (a.created_at && b.created_at) {
            const comp = a.created_at.getTime() - b.created_at.getTime();
            if (comp != 0) return comp;
          }
          if (b.created_at) {
            return -1;
          }
          if (a.created_at) {
            return 1;
          }
          // 登録日が同じなら名前でソート
          return a.name.localeCompare(b.name);
        });
        sortShoppingItem(newItems);
      },
    },
    {
      key: "2",
      label: "アイウエオ順",
      icon: <SortAscendingOutlined />,
      onClick: () => {
        const newItems = shoppingItems.sort((a, b) => {
          // 購入済みでソートする場合
          if (boughtOrder) {
            if (a.finished_at && !b.finished_at) {
              return 1;
            } else if (!a.finished_at && b.finished_at) {
              return -1;
            }
          }
          // 名前でソート
          return a.name.localeCompare(b.name);
        });
        sortShoppingItem(newItems);
      },
    },
    {
      key: "3",
      label: "カテゴリー順",
      icon: <DatabaseOutlined />,
      onClick: () => {
        const newItems = shoppingItems.sort((a, b) => {
          // 購入済みでソートする場合
          if (boughtOrder) {
            if (a.finished_at && !b.finished_at) {
              return 1;
            } else if (!a.finished_at && b.finished_at) {
              return -1;
            }
          }
          // カテゴリでソート
          const cat_a = categories.find((m) => m.name == a.category_name)?.id;
          const cat_b = categories.find((m) => m.name == b.category_name)?.id;
          if (cat_a && cat_b) {
            const comp = cat_a - cat_b;
            if (comp != 0) return comp;
          }
          if (cat_b) {
            return -1;
          }
          if (cat_a) {
            return 1;
          }
          // カテゴリが同じなら名前でソート
          return a.name.localeCompare(b.name);
        });
        sortShoppingItem(newItems);
      },
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={boughtOrder}
            onChange={(e) => {
              e.stopPropagation();
              SetboughtOrder(!boughtOrder);
            }}
          >
            買い物済と分ける
          </Checkbox>
        </div>
      ),
    },
  ];

  // メニュー項目
  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      label: "全て買い物前に戻す",
      icon: <BorderOutlined />, 
      onClick: () => {
        updateShoppingItems(
          shoppingItems.map((itm) => itm.id!),
          { finished_at: null }
        );
      },
    },
    {
      key: "2",
      label: "全て買い物済にする",
      icon: <CheckSquareOutlined />,
      onClick: () => {
        updateShoppingItems(
          shoppingItems.map((itm) => itm.id!),
          { finished_at: new Date() }
        );
      },
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "買い物済を全て削除",
      icon: <DeleteOutlined />,
      onClick: () => {
        removeShoppingItems(shoppingItems.filter((itm) => itm.finished_at != null).map(itm=>itm.id!));
      },
    },
    {
      key: "4",
      label: "全て削除",
      icon: <DeleteFilled />,
      onClick: () => {
        removeShoppingItems(shoppingItems.map(itm=>itm.id!));
      },
    },
  ];

  return (
    <div>
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
                {/* ローディングをここに置く */}
                <span><Spin spinning={loading} ></Spin></span>
            </Col>
          </Row>
        </Col>
        <Col flex="noen">
          <Row justify="end">
            <Col>
              <Space>
                <Dropdown
                  menu={{ items: sortItems }}
                  placement="bottomRight"
                >
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
      <DndContext 
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext 
          items={shoppingItems.map((m) => m.id!)}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              userSelect: "none",
            }}
          >
            {shoppingItems.map((item) => (
              <ShoppingCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
export default ShoppingCardBox;