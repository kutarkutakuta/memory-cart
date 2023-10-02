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
  MenuProps,
  Modal,
  Row,
  Space,
  Spin,
  message,
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
  SyncOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useCallback, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
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
    fetchShoppingItems,
  } = useShoppingItemStore();

  // メッセージ用Hook
  const [modal, contextHolder] = Modal.useModal();

  // 買い物済みでソートする
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
          // 買い物済みでソートする場合
          if (boughtOrder) {
            if (a.finished_at && !b.finished_at) {
              return 1;
            } else if (!a.finished_at && b.finished_at) {
              return -1;
            }
          }
          // 登録日でソート　→　IDでソート
          if (a.id && b.id) {
            const comp = a.id - b.id;
            if (comp != 0) return comp;
          }
          else if (b.id) {
            return -1;
          }
          else if (a.id) {
            return 1;
          }
          else {
            // 登録日が同じなら名前でソート
            return a.name.localeCompare(b.name);
          }
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
          else if (cat_b) {
            return -1;
          }
          else if (cat_a) {
            return 1;
          }
          else{
            // カテゴリが同じなら名前でソート
            return a.name.localeCompare(b.name);
          }

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
        modal.confirm({
          title: "買い物済を全て削除します",
          icon: <ExclamationCircleFilled />,
          content: "よろしいですか？",
          okText: "削除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk: () => {
            removeShoppingItems(
              shoppingItems
                .filter((itm) => itm.finished_at != null)
                .map((itm) => itm.id!)
            );
          },
        });
      },
    },
    {
      key: "4",
      label: "品物を全て削除",
      icon: <DeleteFilled />,
      onClick: () => {
        modal.confirm({
          title: "品物を全て削除します",
          icon: <ExclamationCircleFilled />,
          content: "よろしいですか？",
          okText: "削除",
          okType: "danger",
          cancelText: "キャンセル",
          onOk: () => {
            removeShoppingItems(shoppingItems.map((itm) => itm.id!));
          },
        });
      },
    },
  ];

  return (
    <div>
      {contextHolder}
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
              <span>
                <Spin spinning={loading}></Spin>
              </span>
            </Col>
          </Row>
        </Col>
        <Col flex="noen">
          <Row justify="end">
            <Col>
              <Space>
                {shoppingList?.isShare ? (
                  <Button
                    type={"text"}
                    icon={<SyncOutlined />}
                    onClick={() =>
                      fetchShoppingItems(shoppingList?.list_key!).then(() =>
                        message.info("データをサーバーと同期しました。")
                      )
                    }
                  ></Button>
                ) : null}
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
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext
          items={shoppingItems.map((m) => m.id!)}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              userSelect: "none",
              gap: "2px",
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
