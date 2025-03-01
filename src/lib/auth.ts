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
      emailRedirectTo: undefined,
      emailConfirm: false
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

export const signIn = async ({ email, password, rememberMe = true }: SignInData) => {
  // Configure as opções de persistência da sessão com base no rememberMe
  const persistOptions = {
    persistSession: rememberMe
  };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  }, persistOptions);

  if (error) {
    console.error("Login error:", error);
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
  try {
    // First check the session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.message?.includes("Refresh Token")) {
        // Clear the session if refresh token is invalid
        await supabase.auth.signOut();
        throw new Error("Session expired. Please sign in again.");
      }
      console.error("Auth error:", error);
      return null;
    }

    if (!data.user) {
      return null;
    }
    // Get additional user data from our users table
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("user_name,is_active")
      .eq("auth_id", data.user.id)
      .single();
    if (userDataError) {
      console.error("Error fetching user data:", userDataError);
      // If user data doesn't exist, create it
      if (userDataError.code === "PGRST116") {
        const { data: newUserData, error: insertError } = await supabase
          .from("users")
          .insert({
            auth_id: data.user.id,
            email: data.user.email,
            user_name: data.user.user_metadata?.user_name
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user data:", insertError);
          throw new Error("Failed to create user profile");
        }

        return {
          id: data.user.id,
          email: data.user.email || "",
          user_name: newUserData?.user_name
        };
      }
      throw new Error("Failed to fetch user profile");
    }
    return {
      id: data.user.id,
      email: data.user.email || "",
      user_name: userData?.user_name
    };
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    throw err;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};
