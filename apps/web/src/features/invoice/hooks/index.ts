"use client";
import type { ApiErrorLike } from "@/lib/api/errors";
import axios, { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore, useLogout } from "@/features/auth/store";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import {
  CreateCommentPayload,
  InvoiceResponseType,
  InvoiceType,
  PaginatedCommentsResponse,
} from "@/features/invoice/types";
import { useToast } from "@/lib/use-toast";
import { authRoutes, invoiceRoutes } from "@/lib/routes";
import { axiosInstance } from "@/lib/api/client";
import {
  useCommentFilter,
  useInvoiceFilter,
} from "@/features/invoice/store";

// export const useCreateInvoice = () => {
//   const toast = useToast();
//   const credentials = useAuthStore((state) => state.credentials);
//   const logout = useLogout();
//   const axiosAuth = useAxiosAuth();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const is_profile_complete = credentials?.user?.profile_complete;

//   // Define the function to handle the registration API call

//   const handleCreateInvoice = async (data: InvoiceType) => {
//     // const response = await get('/auth/clear')
//     const response = await axiosAuth.post("/invoice", {
//       title: data.title,
//       payer_name: data.payer_name,
//       payer_email: data.payer_email,
//       country: data.country,
//       invoice_items: data.invoice_items,
//       due_date: data.due_date,
//       service_fee: data.service_fee,
//     });
//     // console.log(response);
//     return response.data;
//   };

//   // Use React Query's useMutation hook with additional configurations
//   const mutation = useMutation<
//     InvoiceResponseType,
//     AxiosError<InvoiceResponseType>,
//     InvoiceType
//   >({
//     mutationFn: handleCreateInvoice,
//     onSuccess: (data: InvoiceResponseType) => {
//       // console.log(data);

//       queryClient.invalidateQueries({ queryKey: ["invoices"] });
//       toast.success(data.message);
//       router.push(invoiceRoutes.INVOICES);
//     },
//     onError: (error) => {
//       const errorMessage =
//         axios.isAxiosError(error) && error?.response?.data?.message
//           ? error?.response?.data?.message
//           : "An unknown error occurred.";
//       if (error.response?.status === 401) {
//         toast.error("Unauthorized Access");
//         router.push(authRoutes.LOGIN);
//         logout();
//       } else {
//         if (is_profile_complete) {
//           toast.error(errorMessage);
//         }
//       }
//       // console.log(error?.response);
//     },
//   });

//   // Return the mutation object to use in components
//   return mutation;
// };

// export const useCreateInvoice = () => {
//   const toast = useToast();
//   const credentials = useAuthStore((state) => state.credentials);
//   const logout = useLogout();
//   const axiosAuth = useAxiosAuth();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const is_profile_complete = credentials?.user?.profile_complete;

//   const handleCreateInvoice = async (data: InvoiceType) => {
//     const formData = new FormData();

//     formData.append("title", data.title || "");
//     formData.append("payer_name", data.payer_name || "");
//     formData.append("payer_email", data.payer_email || "");
//     formData.append("country", data.country || "");
//     formData.append("due_date", data.due_date || "");
//     formData.append("template_id", data.template_id || ""); // REQUIRED
//     formData.append("service_fee", String(data.service_fee));
//     formData.append("make_default", String(data.make_default));
//     formData.append("invoice_items", JSON.stringify(data.invoice_items));
//     formData.append("template_id", JSON.stringify(data.template_id));
//     if (data.logo) {
//       formData.append("logo", data.logo);
//       formData.append("filename", data.logo);
//     }

//     const response = await axiosAuth.post("/invoice", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // console.log("CREATE INVOICE RESPONSE:", response);
//     console.log("CREATE INVOICE RESPONSE:", data);

//     // return response.data;
//   };

//   return useMutation({
//     mutationFn: handleCreateInvoice,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["invoices"] });
//       // toast.success(data.message);
//       toast.success('data.message');
//       // router.push(invoiceRoutes.INVOICES);
//     },
//     onError: (error: ApiErrorLike) => {
//       const errorMessage =
//         error?.response?.data?.message ?? "An unknown error occurred.";

//       if (error.response?.status === 401) {
//         toast.error("Unauthorized Access");
//         logout();
//         router.push(authRoutes.LOGIN);
//       } else if (is_profile_complete) {
//         toast.error(errorMessage);
//       }
//     },
//   });
// };

export const useCreateInvoice = () => {
  const toast = useToast();
  const credentials = useAuthStore((state) => state.credentials);
  const logout = useLogout();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_profile_complete = credentials?.user?.profile_complete;

  const handleCreateInvoice = async (data: InvoiceType) => {
    const formData = new FormData();

    formData.append("title", data.title || "");
    formData.append("payer_name", data.payer_name || "");
    formData.append("payer_email", data.payer_email || "");
    formData.append("country", data.country || "");
    formData.append("due_date", data.due_date || "");
    formData.append("template_id", data.template_id || ""); // REQUIRED - only once, as string
    formData.append("service_fee", String(data.service_fee));
    formData.append("make_default", String(data.make_default));
    formData.append("note", String(data.note));

    // ✅ Stringify invoice_items properly
    formData.append(
      "invoice_items",
      data.invoice_items ? JSON.stringify(data.invoice_items) : "[]",
    );

    // ✅ Handle logo file correctly
    if (data.logo && data.logo instanceof File) {
      formData.append("logo", data.logo, data.filename); // File object with filename
    }

    const response = await axiosAuth.post("/invoice", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // console.log("CREATE INVOICE RESPONSE:", response.data);
    return response.data;
  };

  return useMutation({
    mutationFn: handleCreateInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(data.message || "Invoice created successfully");
      const id = data?.data?.id;
      router.push(id ? invoiceRoutes.PREVIEW_INVOICE({ invoice_id: id }) : invoiceRoutes.INVOICES);
    },
    onError: (error: ApiErrorLike) => {
      const errorMessage =
        error?.response?.data?.message ?? "An unknown error occurred.";

      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        logout();
        router.push(authRoutes.LOGIN);
      } else if (is_profile_complete) {
        toast.error(errorMessage);
      }

      // Log the error for debugging
      console.error("Invoice creation error:", error.response?.data);
    },
  });
};

export const useUpdateInvoice = ({ invoiceId }: { invoiceId: string }) => {
  const toast = useToast();
  const credentials = useAuthStore((state) => state.credentials);
  const logout = useLogout();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_profile_complete = credentials?.user?.profile_complete;

  const handleCreateInvoice = async (data: InvoiceType) => {
    const formData = new FormData();

    formData.append("title", data.title || "");
    formData.append("payer_name", data.payer_name || "");
    formData.append("payer_email", data.payer_email || "");
    formData.append("country", data.country || "");
    formData.append("due_date", data.due_date || "");
    formData.append("template_id", data.template_id || ""); // REQUIRED - only once, as string
    formData.append("service_fee", String(data.service_fee));
    formData.append("make_default", String(data.make_default));
    formData.append("note", String(data.note));

    // ✅ Stringify invoice_items properly
    formData.append(
      "invoice_items",
      data.invoice_items ? JSON.stringify(data.invoice_items) : "[]",
    );

    // ✅ Handle logo file correctly
    if (data.logo && data.logo instanceof File) {
      formData.append("logo", data.logo, data.filename); // File object with filename
    }

    const response = await axiosAuth.put(`/invoice/${invoiceId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("updated INVOICE RESPONSE:", response.data);
    return response.data;
  };

  return useMutation({
    mutationFn: handleCreateInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-payment", invoiceId] });
      toast.success(data.message || "Invoice Updated successfully");
      router.replace(invoiceRoutes.PREVIEW_INVOICE({ invoice_id: invoiceId }));
    },
    onError: (error: ApiErrorLike) => {
      const errorMessage =
        error?.response?.data?.message ?? "An unknown error occurred.";

      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        logout();
        router.push(authRoutes.LOGIN);
      } else if (is_profile_complete) {
        toast.error(errorMessage);
      }

      // Log the error for debugging
      console.error("Invoice creation error:", error.response?.data);
    },
  });
};

export const useGetInvoices = ({
  order_by = "desc",
  // page = 1,
  page_count = 10,
  paid = false,
}: {
  order_by?: string;
  page?: number;
  page_count?: number;
  paid?: boolean;
}) => {
  // const router = useRouter();
  const credentials = useAuthStore((state) => state.credentials);
  const { get } = useAxiosAuth();
  const { page, status, search } = useInvoiceFilter();
  // const { order_by, page, page_count, status } = useFetchInvoiceParams();

  const user_id = credentials?.user?.profile?.id;
  const handleGetInvoices = async () => {
    const params = new URLSearchParams();

    if (user_id) params.append("user_id", user_id);
    if (order_by) params.append("order_by", order_by);
    if (page_count) params.append("limit", page_count.toString());
    if (status && status !== "all" && !paid) params.append("status", status);
    if (paid) params.append("status", "paid");
    if (page) params.append("page", page.toString());
    if (search) params.append("search", search);

    const url = `/invoice?${params.toString()}`;
    // const url = `/invoice`;
    const res = await get(url);
    // console.log(res);
    return res.data.data;
  };

  return useQuery({
    queryKey: ["invoices", page, page_count, status, order_by, user_id, search],
    queryFn: handleGetInvoices,
    enabled: !!credentials?.access_token,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetInvoice = ({ invoice_id }: { invoice_id: string }) => {
  const credentials = useAuthStore((state) => state.credentials);
  const { get } = useAxiosAuth();

  const handleGetInvoice = async () => {
    // const params = new URLSearchParams();

    // if (invoice_id) params.append("id", invoice_id);

    // const url = `/invoice/search?${params.toString()}`;
    const url = `/invoice/${invoice_id}`;
    const res = await get(url);

    // console.log(response.data);
    // responseStatus(res.status, res.data, router);
    return res.data.data;
  };

  return useQuery({
    queryKey: ["invoice", invoice_id],
    queryFn: handleGetInvoice,
    enabled: !!credentials?.access_token && !!invoice_id,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetInvoiceForClient = ({
  invoice_url,
  pollWhile,
}: {
  invoice_url: string;
  /** Re-read every 3 s while this holds, e.g. until a review the payer just sent shows up. */
  pollWhile?: (invoice: InvoiceType | undefined) => boolean;
}) => {
  // const { get } = useAxiosAuth();

  const handleGetInvoiceForClient = async () => {
    const params = new URLSearchParams();

    if (invoice_url) params.append("url", invoice_url);

    const url = `/invoice/search?${params.toString()}`;
    // const url = `/invoice/search?url=78522-6b18I-5f2fa428f4848385N0`;
    const res = await axiosInstance.get(url);

    // console.log(invoice_url);

    // console.log(res);
    // responseStatus(res.status, res.data, router);
    return res.data.data;
  };

  return useQuery({
    queryKey: ["client_invoice", invoice_url],
    queryFn: handleGetInvoiceForClient,
    // A missing or unsent invoice is a 404: show it straight away instead of retrying.
    retry: (count, error) => {
      const status = (error as ApiErrorLike)?.response?.status ?? 0;
      return count < 2 && !(status >= 400 && status < 500);
    },
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (pollWhile?.(query.state.data as InvoiceType | undefined) ? 3000 : false),
  });
};

/** The API refuses a second review; that means the first one landed, not that something failed. */
export const isAlreadyReviewed = (error: unknown) =>
  /already\s+(been\s+)?reviewed/i.test((error as ApiErrorLike)?.response?.data?.message ?? "");

export const useSendInvoice = (invoiceId: string) => {
  const toast = useToast();
  const logout = useLogout();
  const { post } = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Define the function to handle the send invoice API call
  const handleSendInvoice = async ({ emails }: { emails: string[] }) => {
    const response = await post(`/invoice/send/${invoiceId}`, {
      emails: emails,
    });
    return response.data;
  };

  // Use React Query's useMutation hook
  const mutation = useMutation<
    InvoiceResponseType,
    AxiosError<InvoiceResponseType>,
    { emails: string[] } // Accept emails object as parameter
  >({
    mutationFn: handleSendInvoice,
    onSuccess: (data: InvoiceResponseType) => {
      toast.success(data.message);

      // Refresh in place (a reload would swallow the toast): the status badge, list and payment strip.
      for (const key of ["invoice", "invoices", "invoice-payment", "notifications"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        router.push(authRoutes.LOGIN);
        logout();
      } else {
        toast.error(errorMessage);
      }
      // console.log(error?.response);
    },
  });

  return mutation;
};

// export const useSendInvoice = (invoiceId: string, email?: string) => {
//   const toast = useToast();
//   const logout = useLogout();
//   const { get } = useAxiosAuth();
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   // Define the function to handle the send invoice API call
//   const handleSendInvoice = async () => {
//     // Build the URL conditionally based on whether email is provided
//     const url = email
//       ? `/invoice/send/${invoiceId}?email=${email}`
//       : `/invoice/send/${invoiceId}`;

//     const response = await get(url);
//     // console.log(response);
//     return response.data;
//   };

//   // Use React Query's useMutation hook
//   const mutation = useMutation<
//     InvoiceResponseType,
//     AxiosError<InvoiceResponseType>,
//     void // No parameters needed since we're using closure
//   >({
//     mutationFn: handleSendInvoice,
//     onSuccess: (data: InvoiceResponseType) => {
//       // console.log(data);
//       toast.success(data.message);

//       queryClient.invalidateQueries({ queryKey: ["invoice", "invoices"] });
//       window.location.reload();
//     },
//     onError: (error) => {
//       const errorMessage =
//         axios.isAxiosError(error) && error?.response?.data?.message
//           ? error?.response?.data?.message
//           : "An unknown error occurred.";
//       if (error.response?.status === 401) {
//         toast.error("Unauthorized Access");
//         router.push(authRoutes.LOGIN);
//         logout();
//       } else {
//         toast.error(errorMessage);
//       }
//       console.log(error?.response);
//     },
//   });

//   return mutation;
// };

/** The decision travels with each call (`mutate(true | false)`), so a click never sends the previous answer. */
export const useReviewInvoice = (invoiceId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const handleSendInvoice = async (approve: boolean) => {
    // The API takes the decision in the body (POST since 2026-10-22; the old GET is refused).
    const response = await axiosInstance.post(`/invoice/review/${invoiceId}`, { approve });
    return response.data;
  };

  const mutation = useMutation<
    InvoiceResponseType,
    AxiosError<InvoiceResponseType>,
    boolean
  >({
    retry: false,
    mutationFn: handleSendInvoice,
    onSuccess: (data: InvoiceResponseType) => {
      toast.success(data.message);
      // This will invalidate all queries that start with ["client_invoice"]
      queryClient.invalidateQueries({
        queryKey: ["client_invoice"],
        exact: false, // This allows partial matching
      });
    },
    onError: (error) => {
      if (isAlreadyReviewed(error)) {
        queryClient.invalidateQueries({ queryKey: ["client_invoice"], exact: false });
        return;
      }
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      toast.error(errorMessage);
      console.log(error?.response);
    },
  });

  return mutation;
};

export const useDeleteInvoice = (invoiceId: string) => {
  const toast = useToast();
  const logout = useLogout();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  // Define the function to handle the send invoice API call
  const handleSendInvoice = async () => {
    // Build the URL conditionally based on whether email is provided
    const url = `/invoice/${invoiceId}`;

    const response = await axiosAuth.delete(url);
    // console.log(response);
    return response.data;
  };

  // Use React Query's useMutation hook
  const mutation = useMutation<
    InvoiceResponseType,
    AxiosError<InvoiceResponseType>,
    void // No parameters needed since we're using closure
  >({
    mutationFn: handleSendInvoice,
    onSuccess: (data: InvoiceResponseType) => {
      // console.log(data);
      toast.success(data.message);
      router.replace(invoiceRoutes.INVOICES);

      queryClient.invalidateQueries({ queryKey: ["invoices", "invoice"] });
    },
    onError: (error) => {
      const errorMessage =
        axios.isAxiosError(error) && error?.response?.data?.message
          ? error?.response?.data?.message
          : "An unknown error occurred.";
      if (error.response?.status === 401) {
        toast.error("Unauthorized Access");
        router.push(authRoutes.LOGIN);
        logout();
      } else {
        toast.error(errorMessage);
      }
      console.log(error?.response);
    },
  });

  return mutation;
};

////////////////////////// COMMENTS //////////////////////////
export const useCreateComment = (token: string) => {
  const toast = useToast();
  const credentials = useAuthStore((state) => state.credentials);
  const logout = useLogout();
  const axiosAuth = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const is_profile_complete = credentials?.user?.profile_complete;

  // Define the function to handle the registration API call

  const handleCreateComment = async (data: CreateCommentPayload) => {
    // const response = await get('/auth/clear')
    const response = await axiosAuth.post("/comments", {
      user_id: credentials?.user?.profile?.id,
      invoice_id: data.invoice_id,
      commenter_name: credentials?.user?.profile.first_name,
      comment_text: data.comment_text,
      commenter_email: credentials?.user?.profile.email,
      token,
      parent_id: data.parent_id,
    });
    //     {
    //   "invoice_id": "{{invoiceId}}",
    //   "comment_text": "I love this, we can pay now",
    // }
    console.log(token);
    return response.data;
  };

  // Use React Query's useMutation hook with additional configurations
  const mutation = useMutation<
    PaginatedCommentsResponse,
    AxiosError<PaginatedCommentsResponse>,
    CreateCommentPayload
  >({
    mutationFn: handleCreateComment,
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Comment Successful");
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

export const useGetComments = (invoice_id: string) => {
  // const { get } = useAxiosAuth();
  const { page, limit, sort_order } = useCommentFilter();

  const handleGetComments = async () => {
    const params = new URLSearchParams();

    if (invoice_id) params.append("invoice_id", invoice_id);
    if (sort_order) params.append("sort_order", sort_order);
    if (limit) params.append("limit", limit.toString());
    if (page) params.append("page", page.toString());

    const url = `/comments?${params.toString()}`;
    // const url = `/invoice`;
    const res = await axiosInstance.get(url);
    // console.log(res);
    return res.data.data;
  };

  return useQuery({
    queryKey: ["comments", page, limit, sort_order, invoice_id],
    queryFn: handleGetComments,
    // enabled: !!credentials?.access_token,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
