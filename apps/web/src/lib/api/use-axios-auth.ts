"use client";

import { axiosAuth } from "@/lib/api/client";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function useAxiosAuth() {
  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        // 👇 Read token on EACH request, not just on mount
        const accessToken = Cookies.get("access_token");

        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
    };
  }, []); // Empty dependency array is fine now

  return axiosAuth;
}

// export default function useAxiosAuth() {
//   useEffect(() => {
//     const accessToken = Cookies.get("access_token"); // 👈 get token from cookies


//     const requestIntercept = axiosAuth.interceptors.request.use(
//       (config) => {
//         if (accessToken && !config.headers["Authorization"]) {
//           config.headers["Authorization"] = `Bearer ${accessToken}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     return () => {
//       axiosAuth.interceptors.request.eject(requestIntercept);
//     };
//   }, []);

//   return axiosAuth;
// }

// // "use client";

// import { axiosAuth } from "@/lib/api/client";
// import { useEffect } from "react";
// import { userAuth } from "../store/userAuth";

// export default function useAxiosAuth() {
//   const { credentials: auth } = userAuth();
//   // const refresh = useRefreshToken();

//   //   console.log('auth token cred', auth)

//   useEffect(() => {
//     const requestIntercept = axiosAuth.interceptors.request.use(
//       (config) => {
//         if (!config.headers["Authorization"]) {
//           config.headers["Authorization"] = `Bearer ${auth?.access_token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // const responseIntercept = axiosAuth.interceptors.response.use(
//     //   (response) => response,
//     //   async (error) => {
//     //     const prevRequest = error?.config;
//     //     if (error?.response?.status === 403 && !prevRequest?.sent) {
//     //       prevRequest.sent = true;
//     //       const newAccessoken = await refresh();
//     //       prevRequest.headers["Authorization"] = newAccessoken;
//     //       return axiosAuth(prevRequest);
//     //     }
//     //     return Promise.reject(error);
//     //   }
//     // );

//     return () => {
//       // axiosAuth.interceptors.response.eject(responseIntercept);
//       axiosAuth.interceptors.request.eject(requestIntercept);
//     };
//   }, [auth]);

//   return axiosAuth;
// }
