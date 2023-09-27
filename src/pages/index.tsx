"use client"
import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";
import ShoppingListBox from "@/components/ShoppingListBox/ShoppingListBox";
import { ShoppingListMenu } from "@/components/Menu/ShoppingListMenu/ShoppingListMenu";
import useMasterStore from "@/stores/useMasterStore";

const HomePage = () => {
  
   // マスター取得
   const { fetchData } = useMasterStore();
   useEffect(() => {
     fetchData();
   }, []);
   
  return (
  <>
    <header>
      <MyHeader title="お買い物リスト" isShare={false}></MyHeader>
    </header>
    <main>
      <ShoppingListBox></ShoppingListBox>
    </main>
    <ShoppingListMenu></ShoppingListMenu>
  </>
)};

export default HomePage;
