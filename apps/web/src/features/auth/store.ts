import { create } from "zustand";
import Cookies from "js-cookie";
import { IUser } from "@/features/auth/types";
import { queryClient } from "@/components/providers/ReactQueryProvider";

type AuthState = {
  credentials: {
    access_token: string;
    user: IUser | null;
  } | null;
  isInitialized: boolean;
  setCredentials: (access_token: string, user: IUser) => void;
  logout: () => void;
  initializeAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  credentials: null,
  isInitialized: false,

  setCredentials: (access_token, user) => {
    Cookies.set("access_token", access_token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });

    set({ credentials: { access_token, user }, isInitialized: true });
  },

  logout: () => {
    Cookies.remove("access_token");
    queryClient.clear();
    set({ credentials: null, isInitialized: true });
  },

  initializeAuth: () => {
    const access_token = Cookies.get("access_token");

    if (access_token) {
      set({
        credentials: { access_token, user: null },
        isInitialized: true,
      });
    } else {
      set({ credentials: null, isInitialized: true });
    }
  },
}));

// 👇 Create a separate hook for the logout function specifically
export const useLogout = () => useAuthStore((state) => state.logout);

// import { create } from "zustand";
// import Cookies from "js-cookie";
// import { IUser } from "@/features/auth/types";
// import { queryClient } from "@/components/providers/ReactQueryProvider";

// type AuthState = {
//   credentials: {
//     access_token: string;
//     user: IUser | null;
//   } | null;

//   isInitialized: boolean;
//   setCredentials: (access_token: string, user: IUser) => void;
//   logout: () => void;
//   initializeAuth: () => void;
// };

// export const userAuth = create<AuthState>((set) => ({
//   credentials: null,
//   isInitialized: false,

//   setCredentials: (access_token, user) => {
//     Cookies.set("access_token", access_token, {
//       expires: 1,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Lax",
//       path: "/",
//     });

//     set(() => ({
//       credentials: { access_token, user },
//       isInitialized: true,
//     }));
//   },

//   logout: () => {
//     Cookies.remove("access_token");
//     queryClient.clear();

//     // console.log("it got here", queryClient);
//     set(() => ({
//       credentials: null,
//       isInitialized: true,
//     }));
//   },

//   initializeAuth: () => {
//     const access_token = Cookies.get("access_token");

//     if (access_token) {
//       set(() => ({
//         credentials: {
//           access_token,
//           user: null, // <-- START WITH NULL
//         },
//         isInitialized: true,
//       }));
//     } else {
//       set(() => ({
//         credentials: null,
//         isInitialized: true,
//       }));
//     }
//   },
// }));

// // type AuthState = {
// //   credentials: {
// //     access_token: string;
// //     user: IUser;
// //   } | null;
// //   isInitialized: boolean;
// //   setCredentials: (access_token: string, user: IUser) => void;
// //   logout: () => void;
// //   initializeAuth: () => void;
// // };

// // export const userAuth = create<AuthState>((set) => ({
// //   credentials: null,
// //   isInitialized: false,

// //   setCredentials: (access_token, user) => {
// //     // Store token in cookie
// //     Cookies.set("access_token", access_token, {
// //       expires: 1, // expires in 1 day
// //       secure: process.env.NODE_ENV === "production",
// //       sameSite: "Lax",
// //       path: "/",
// //     });

// //     set(() => ({
// //       credentials: {
// //         access_token,
// //         user,
// //       },
// //       isInitialized: true,
// //     }));
// //   },

// //   logout: () => {
// //     // Remove access_token cookie
// //     Cookies.remove("access_token");

// //     set(() => ({
// //       credentials: null,
// //       isInitialized: true,
// //     }));
// //   },

// //   initializeAuth: () => {
// //     const access_token = Cookies.get("access_token");

// //     if (access_token) {
// //       // NOTE: You can't restore full user data from cookies alone.
// //       // You may need to call an API to fetch the user using the token.
// //       set(() => ({
// //         credentials: {
// //           access_token,
// //           user: {} as IUser, // Placeholder until real user is fetched
// //           wallet: {} as IWallet, // Placeholder until real wallet is fetched
// //           profile_complete: false,
// //           email_verified: false,
// //         },
// //         isInitialized: true,
// //       }));
// //     } else {
// //       set(() => ({
// //         credentials: null,
// //         isInitialized: true,
// //       }));
// //     }
// //   },
// // }));

// // // // userAuth.ts - Zustand store for credentials only
// // // import { create } from "zustand";
// // // import { IUser } from "../lib/types/userTypes";

// // // type AuthState = {
// // //   credentials: {
// // //     profile_complete: boolean;
// // //     email_verified: boolean;
// // //     access_token: string;
// // //     user: IUser;
// // //   } | null;
// // //   isInitialized: boolean;
// // //   setCredentials: (
// // //     access_token: string,
// // //     user: IUser,
// // //     profile_complete: boolean,
// // //     email_verified: boolean
// // //   ) => void;
// // //   logout: () => void;
// // //   initializeAuth: () => void;
// // // };

// // // export const userAuth = create<AuthState>((set) => ({
// // //   credentials: null,
// // //   isInitialized: false,

// // //   setCredentials: (access_token, user, profile_complete, email_verified) => {
// // //     // Update state with all credential data
// // //     set(() => ({
// // //       credentials: { access_token, user, profile_complete, email_verified },
// // //       isInitialized: true,
// // //     }));
// // //   },

// // //   logout: () => {
// // //     // Clear sessionStorage (only the token)
// // //     sessionStorage.removeItem("access_token");

// // //     // Clear state
// // //     set(() => ({ credentials: null, isInitialized: true }));
// // //   },

// // //   initializeAuth: () => {
// // //     // Just mark as initialized - don't load anything from storage except checking if token exists
// // //     set(() => ({ isInitialized: true }));
// // //   },
// // // }));
