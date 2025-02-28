import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  user_name?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const signUp = async ({ email, password, name }: SignUpData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: name,
      },
    },
  });

  if (error) {
    throw error;
  }

  // If sign up is successful, also create a record in our users table
  if (data.user) {
    const { error: insertError } = await supabase.from("users").insert({
      auth_id: data.user.id,
      email: data.user.email,
      user_name: name,
    });

    if (insertError) {
      console.error("Error creating user record:", insertError);
    }
  }

  return data;
};

export const signIn = async ({ email, password }: SignInData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Update last_login timestamp
  if (data.user) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("auth_id", data.user.id);

    if (updateError) {
      console.error("Error updating last login:", updateError);
    }
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return null;
  }

  // Get additional user data from our users table
  const { data: userData, error } = await supabase
    .from("users")
    .select("user_name, is_active")
    .eq("auth_id", data.user.id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
  }

  return {
    id: data.user.id,
    email: data.user.email || "",
    user_name: userData?.user_name,
  };
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};
