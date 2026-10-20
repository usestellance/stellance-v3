import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/lib/api/use-axios-auth";
import { useAuthStore } from "@/features/auth/store";

export const useGetInvoiceOverview = (month?: string) => {
  const { get } = useAxiosAuth();
  const credentials = useAuthStore((s) => s.credentials);

  return useQuery({
    queryKey: ["invoice-overview", month],
    queryFn: async () => {
      const params = month ? `?month=${month}` : "";
      const res = await get(`/invoice/overview${params}`);
      return res.data.data;
    },
    enabled: !!credentials?.access_token,
    refetchOnWindowFocus: false,
  });
};

export const useGetCashInflow = ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const { get } = useAxiosAuth();
  const credentials = useAuthStore((s) => s.credentials);

  return useQuery({
    queryKey: ["cash-inflow", from, to],
    queryFn: async () => {
      const res = await get(`/transaction/inflow?from=${from}&to=${to}`);
      console.log("Cash Inflow Response:", res);
      return res.data.data;
    },
    enabled: !!credentials?.access_token,
    refetchOnWindowFocus: false,
  });
};

export const useGetTransactionStats = () => {
  const { get } = useAxiosAuth();
  const credentials = useAuthStore((s) => s.credentials);

  return useQuery({
    queryKey: ["transaction-stats"],
    queryFn: async () => {
      const res = await get("/transaction/stats");
      // console.log("Transaction Stats Response:", res);
      return res.data.data;
    },
    enabled: !!credentials?.access_token,
    refetchOnWindowFocus: false,
  });
};
