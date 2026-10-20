import { IWallet } from "@/features/wallet/types";


export interface IUser {
  email_verified: boolean;
  profile: IProfile;
  profile_complete: boolean;
  wallet: IWallet;
}

export interface IProfile {
  id?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  country?: string;
  phone_number?: string;
  is_active?: boolean;
  role?: string;
  otp?: string;
}

export interface ILoginResponse {
  status_code: number;
  message: string;
  data: {
    access_token: string;
    email_verified: boolean;
    profile_complete: boolean;
    expires_in: number;
    user: IProfile;
  };
}
export interface IUpdateUserResponse {
  status_code: number;
  message: string;
  data: IUser;
}

export interface UserFormValues {
  email?: string;
  first_name?: string;
  last_name?: string;
  business_name?: string;
  phone_number?: string;
  country?: string;
  wallet_address?: string;
  password?: string;
  confirm_password?: string;
  new_password?: string;
  old_password?: string;
  otp?: string;
  currency?: string;
}
