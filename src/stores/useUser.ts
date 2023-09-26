import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

/**
 * ユーザー情報
 */
export interface User {
  id: number;
  fullname: string | null;
  avatarurl: string | null;
  nickname: string | null;
}

export default function useUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    const setupUser = async () => {
      if (session?.user.id) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(user);
      }
    };
    setupUser();
  }, [session]);

  function signInWithGoogle() {
    supabase.auth.signInWithOAuth({ 
        provider: "google",
        // options: {
        //     queryParams: {
        //       access_type: 'offline',
        //       prompt: 'consent',
        //     },
        //   },
    });
  }

  function signOut() {
    supabase.auth.signOut();
  }

  return {
    session,
    user,
    signInWithGoogle,
    signOut,
  };
}
