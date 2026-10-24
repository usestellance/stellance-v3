import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import { useAuthStore, useLogout } from "@/features/auth/store";
import { useToast } from "@/lib/use-toast";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { authRoutes } from "@/lib/routes";
import { NotificationsItem } from "@/features/notifications/types";
import { useVariableStore } from "@/features/notifications/store";

export const useGetNotifications = () => {
  const credentials = useAuthStore((state) => state.credentials);
  const { get } = useAxiosAuth();
  const { notificationsCount, notificationsOrder, notificationsPage } =
    useVariableStore();

  const handleGetNotifications = async () => {
    const params = new URLSearchParams();
    params.append("count", notificationsCount.toString());
    params.append("page", notificationsPage.toString());
    params.append("order_by", notificationsOrder);

    const url = `/notification?${params.toString()}`;
    const res = await get(url);
    // console.log(res);
    return res.data.data;
  };

  return useQuery({
    queryKey: [
      "notifications",
      notificationsCount,
      notificationsPage,
      notificationsOrder,
    ],
    queryFn: handleGetNotifications,
    enabled: !!credentials?.access_token,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateNotification = () => {
  const toast = useToast();
  const credentials = useAuthStore((state) => state.credentials);
  const logout = useLogout();
  const { patch } = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_profile_complete = credentials?.user?.profile_complete;

  // Define the function to handle the registration API call

  const handleUpdateNotification = async (notificationId?: string) => {
    const params = new URLSearchParams();

    params.append("viewed", "true");

    const url = `/notification/${notificationId}?${params.toString()}`;
    // const url = `/invoice`;
    const res = await patch(url);
    // console.log(res);
    return res.data.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    NotificationsItem,
    AxiosError<NotificationsItem>,
    string | undefined
    // CreateCommentPayload
  >({
    mutationFn: handleUpdateNotification,
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info("Notification read");
      // router.push(invoiceRoutes.INVOICES);
      // window.location.reload()
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) &&
        error?.response?.data &&
        "message" in error.response.data
          ? String((error.response.data as { message?: unknown }).message)
          : "An unknown error occurred.";
      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        router.push(authRoutes.LOGIN);
        logout();
      } else {
        if (is_profile_complete) {
          toast.error(errorMessage);
        }
      }
      // console.log(error?.response);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};

export const useDeleteNotification = () => {
  const toast = useToast();
  const credentials = useAuthStore((state) => state.credentials);
  const logout = useLogout();
  const { patch } = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_profile_complete = credentials?.user?.profile_complete;

  // Define the function to handle the registration API call

  const handleDeleteNotification = async (notificationId?: string) => {
    const url = `/notification/${notificationId}`;

    const res = await patch(url);
    // console.log(res);
    return res.data.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    NotificationsItem,
    AxiosError<NotificationsItem>,
    string | undefined
    // CreateCommentPayload
  >({
    mutationFn: handleDeleteNotification,
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.info("Notification Deleted");
      // router.push(invoiceRoutes.INVOICES);
      // window.location.reload()
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) &&
        error?.response?.data &&
        "message" in error.response.data
          ? String((error.response.data as { message?: unknown }).message)
          : "An unknown error occurred.";
      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        router.push(authRoutes.LOGIN);
        logout();
      } else {
        if (is_profile_complete) {
          toast.error(errorMessage);
        }
      }
      // console.log(error?.response);
    },
  });

  // Return the mutation object to use in components
  return mutation;
};
