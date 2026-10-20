import { StatusType } from "@/components/InvoiceStatusBadge";

export interface InvoiceItemsTypes {
  invoice_type: string;
  description: string;
  quantity: number;
  // unit_price: number | null;
  // discount: number | null;
  // amount: number | null;
  unit_price: number;
  discount: number;
  amount: number;
}

export interface InvoiceType {
  template_id: string;
  // logo: string ;
  logo?: File | null | string;
  filename?: string;
  make_default?: boolean;
  approved?: boolean;
  id?: string;
  invoice_number?: string;
  review_date?: string | null;
  invoice_url?: string;
  title?: string;
  payer_name?: string;
  payer_email?: string;
  country?: string;
  sub_total?: number;
  total?: number;
  currency?: string;
  note?: string;
  logo_url?: string;
  status?: StatusType;
  description?: string;
  due_date?: string;
  service_fee?: number;
  created_at?: string;
  updated_at?: string;
  invoice_items?: InvoiceItemsTypes[];
  items?: InvoiceItemsTypes[];
  // Payment requirements (docs/PLAN.md, D1). The API doesn't return these yet; features/payments/api.ts
  // falls back to the invoice number, the total and the merchant's wallet until it does.
  payment_reference?: string;
  payment_recipient?: string;
  payment_asset_code?: string;
  payment_asset_issuer?: string | null;
  payment_amount?: number;
  payment_expires_at?: string;
  createdBy?: {
    business_name: string;
    wallet_address: string;
    email: string;
    location: string;
    name: string;
    user_id: string;
  };
}

export interface InvoiceResponseType {
  status_code: number;
  message: string;
  data: InvoiceType;
}

export type CreateCommentPayload = {
  user_id?: string;
  invoice_id: string;
  commenter_name?: string;
  comment_text: string;
  token?: string

  // optional (guest comment)
  commenter_email?: string;

  // optional (reply)
  parent_id?: string;
};

export type NullableString = {
  String: string;
  Valid: boolean;
};

export type NullableTime = {
  Time: string;
  Valid: boolean;
};

export type Comment = {
  id: string;
  invoice_id: string;

  user_id: NullableString;

  commenter_name: string;
  commenter_email: string;
  comment_text: string;

  is_verified: boolean;
  is_guest: boolean;

  parent_comment_id: NullableString;

  edited: boolean;
  edited_at: NullableTime;

  created_at: string;
  updated_at: string;

  can_edit: boolean;
  can_delete: boolean;
};

export type CommentStats = {
  invoice_id: string;
  total_comments: number;
  verified_comments: number;
  guest_comments: number;
  top_level_comments: number;
  reply_comments: number;
  latest_comment_at: string;
};

export type GetCommentsResponse = {
  comments: Comment[] | null;
  stats: CommentStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};


export type PaginatedCommentsResponse = {
  comments: Comment[] | null;
  stats: CommentStats;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};
