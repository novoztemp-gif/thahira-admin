import { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "./supabase-client";

const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    try {
      if (providerName) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: providerName,
        });

        if (error) {
          return { success: false, error };
        }

        if (data?.url) {
          return { success: true, redirectTo: "/" };
        }
      }

      // sign in with email and password
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error };
      }

      if (data?.user) {
        // 🔒 THE VAULT DOOR: Check if they are admin BEFORE letting them in
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          await supabaseClient.auth.signOut(); // Kick them out instantly
          return {
            success: false,
            error: {
              name: "Access Denied",
              message: "You are not authorized to access the admin panel.",
            },
          };
        }

        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error: any) {
      return { success: false, error };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "Invalid email or password",
      },
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error };
      }

      if (data) {
        return { success: true, redirectTo: "/" };
      }
    } catch (error: any) {
      return { success: false, error };
    }

    return {
      success: false,
      error: { message: "Register failed", name: "Invalid email or password" },
    };
  },
  forgotPassword: async ({ email }) => {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/update-password` }
      );

      if (error) {
        return { success: false, error };
      }

      if (data) {
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error };
    }

    return {
      success: false,
      error: { message: "Forgot password failed", name: "Invalid email" },
    };
  },
  updatePassword: async ({ password }) => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        password,
      });

      if (error) {
        return { success: false, error };
      }

      if (data) {
        return { success: true, redirectTo: "/" };
      }
    } catch (error: any) {
      return { success: false, error };
    }
    return {
      success: false,
      error: { message: "Update password failed", name: "Invalid password" },
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return { success: false, error };
    }

    return { success: true, redirectTo: "/" };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const { session } = data;

      if (!session) {
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
        };
      }

      // Check if user is still an admin
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        await supabaseClient.auth.signOut();
        return {
          authenticated: false,
          logout: true,
          redirectTo: "/login",
          error: {
            name: "Access Denied",
            message: "You are not authorized to access the admin panel.",
          },
        };
      }

      return { authenticated: true };

    } catch (error: any) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data?.user) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      return profile?.role;
    }

    return null;
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data?.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
};

export default authProvider;