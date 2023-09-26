"use client"
import React, { useEffect } from "react";

import MyHeader from "@/components/MyHeader";
import ShoppingListBox from "@/components/ShoppingListBox";
import { ShoppingListMenu } from "@/components/ShoppingListMenu/ShoppingListMenu";
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
      <MyHeader title="お買い物リスト"></MyHeader>
    </header>
    <main>
      <ShoppingListBox></ShoppingListBox>
    </main>
    <ShoppingListMenu></ShoppingListMenu>
  </>
)};

export default HomePage;
