export interface IWallet {
  chain?: string;
  created_at?: string;
  id?: string;
  is_active?: boolean;
  is_primary?: boolean;
  private_key?: string;
  tag?: string;
  user_id?: string;
  wallet_address?: string;
  address?: string;
  balance?: {
    usdc?: number;
    xlm?: number;
  };
}

// chain
// : 
// "stellar"
// created_at
// : 
// "2025-07-05T21:44:02.034092Z"
// id
// : 
// "b4369211-d022-457a-99ad-cf6d0271fb42"
// is_active
// : 
// true
// is_primary
// : 
// true
// private_key
// : 
// "SAU5M2QCJT7C4GWHJ3TRW5KTFZZNOOZJGHRUP3EJGLP6A2VXEHQTOA3M"
// tag
// : 
// "wallet_1"
// user_id
// : 
// "971d45fb-35fd-470f-9d40-ad7d659956d9"
// wallet_address
// : 
// "GATXFMCQSJ5XIZ2AZOCU47UFZV5Y7HRRGHSNRK2TOQZTPLLV4ZGWZZRO"
