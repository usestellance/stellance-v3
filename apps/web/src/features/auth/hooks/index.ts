import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { axiosInstance } from "@/lib/api/client";
import { authRoutes, backendRoutes, overviewRoutes } from "@/lib/routes";
import { useToast } from "@/lib/use-toast";
import {
  ILoginResponse,
  IUpdateUserResponse,
  IUser,
  UserFormValues,
} from "@/features/auth/types";
import { useLogout } from "@/features/auth/store";
import useAxiosAuth from "@/lib/api/use-axios-auth";

export const useRegister = () => {
  const router = useRouter();
  const toast = useToast();

  // Define the function to handle the registration API call
  const handleRegister = async (data: UserFormValues) => {
    const response = await axiosInstance.post(
      backendRoutes.AUTH_ROUTES.SIGN_UP,
      data,
    );
    return response.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    ILoginResponse,
    AxiosError<ILoginResponse>,
    UserFormValues
  >({
    mutationFn: handleRegister,
    onSuccess: (data: ILoginResponse) => {
      const access_token = data.data.access_token;
      const user = data.data.user;
      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("user", JSON.stringify(user));
      // console.log(data.data);

      toast.success(data.message);
      router.push(authRoutes.VERIFICATION_SENT(user?.email || ""));
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      //   console.log(error?.response?.data);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};

export const useLogin = () => {
  const router = useRouter();
  const toast = useToast();

  const handleLogin = async (data: UserFormValues) => {
    const response = await axiosInstance.post(
      backendRoutes.AUTH_ROUTES.SIGN_IN,
      data,
    );
    return response.data;
  };

  const mutation = useMutation<
    ILoginResponse,
    AxiosError<ILoginResponse>,
    UserFormValues
  >({
    mutationFn: handleLogin,
    onSuccess: (data: ILoginResponse) => {
      const access_token = data.data.access_token;
      const isProfileComplete = data.data.profile_complete;
      const expiresInUnix = data.data.expires_in;

      const expiryDate = new Date(expiresInUnix * 1000);

      Cookies.set("access_token", access_token, {
        expires: expiryDate,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });

      toast.success("Login Successful");

      if (!isProfileComplete) {
        router.push(authRoutes.COMPLETE_PROFILE);
      } else {
        router.push(overviewRoutes.OVERVIEW);
      }
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
    },
  });

  return mutation;
};

export const useCompleteProfile = () => {
  const logout = useLogout();
  const { post } = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  // Define the function to handle the registration API call
  const handleCompleteProfile = async (data: UserFormValues) => {
    // const response = await get('/auth/clear')
    const response = await post(backendRoutes.PROFILE_ROUTES.UPDATE_PROFILE, {
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      business_name: data.business_name,
      Country: data.country,
    });
    // console.log(response);
    return response.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    ILoginResponse,
    AxiosError<ILoginResponse>,
    UserFormValues
  >({
    mutationFn: handleCompleteProfile,
    onSuccess: (data: ILoginResponse) => {
      // 🔁 Invalidate user cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success(data.message);
      router.push(authRoutes.CREATE_FIRST_INVOICE);
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      if (error.response?.status === 401) {
        router.push(authRoutes.LOGIN);
        logout();
      }
      // console.log(error?.response);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};

export const useUpdateProfile = () => {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const axiosAuth = useAxiosAuth();
  const logout = useLogout();

  // Define the function to handle the registration API call
  const handleUpdateProfile = async (data: UserFormValues) => {
    // const response = await get('/auth/clear')
    const response = await axiosAuth.put(
      backendRoutes.PROFILE_ROUTES.UPDATE_PROFILE,
      {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        business_name: data.business_name,
        country: data.country,
      },
    );
    // console.log(response);
    return response.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    IUpdateUserResponse,
    AxiosError<IUpdateUserResponse>,
    UserFormValues
  >({
    mutationFn: handleUpdateProfile,
    onSuccess: (data: IUpdateUserResponse) => {
      // console.log(data.data);
      // const user = data.data;

      // console.log(access_token, user);
      // setCredentials(access_token, user);
      toast.success(data?.message || "");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage || "");
      if (error.response?.status === 401) {
        router.push(authRoutes.LOGIN);
        logout();
      }
      // console.log(error?.response);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};

export const useGetUser = (enabled = true) => {
  // const toast = useToast();
  const { get } = useAxiosAuth();
  // const setCredentials = userAuth((state) => state.setCredentials);

  const handleGetUser = async (): Promise<IUser> => {
    const response = await get(backendRoutes.PROFILE_ROUTES.GET_USER);
    if (!response?.data?.data?.profile) {
      throw new Error("User profile data is missing");
    }
    // console.log(response)
    return response.data.data;
  };

  const query = useQuery<IUser, AxiosError>({
    queryKey: ["user"],
    queryFn: handleGetUser,
    enabled,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  //   useEffect(() => {
  //     if (query.isSuccess && query.data) {
  //       const token = Cookies.get("access_token");
  //     //   if (token) {
  //     //     setCredentials(token, query.data);
  //     //   }
  //     }

  //     if (query.isError) {
  //       toast.error("Failed to fetch user profile.");
  //     }
  //   }, [query.isSuccess, query.isError, query.data]);

  return query;
};

export const useChangePassword = () => {
  // const router = useRouter();
  const toast = useToast();
  const axiosAuth = useAxiosAuth();

  // Define the function to handle the registration API call
  const handleChangePassword = async (data: UserFormValues) => {
    const response = await axiosAuth.post("/auth/change-password", {
      old_password: data.old_password,
      new_password: data.new_password,
    });
    console.log(data);
    return response.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    ILoginResponse,
    AxiosError<ILoginResponse>,
    UserFormValues
  >({
    mutationFn: handleChangePassword,
    onSuccess: (data: ILoginResponse) => {
      toast.success(data.message);
      // router.push(authRoutes.VERIFICATION_SENT(user?.email || ""));
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      console.log(error?.response?.data);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};
