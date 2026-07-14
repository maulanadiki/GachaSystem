export type MenuType = "Events" | "Item Database" | "Global History" | "Settings";

export interface OptionRequest {
  token?: boolean
  isMultipart?: boolean
}
export interface APIResponse<T>{
    success:boolean
    data ?:T|null
    error ?: string
    message?: string
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: 'SSR' | 'SR' | 'R';
  type: 'Hero' | 'Artifact';
  imageUrl?: string;
}

export interface HistoryLog {
  id: string;
  itemName: string;
  rarity: 'SSR' | 'SR' | 'R';
  timestamp: string;
}

export interface PlayerStats {
  coins: number;
  pityCounter: number;
  totalSSR: number;
  totalSummons: number;
  globalRanking: number;
}

export interface eventProps{
  id:string
  event_name:string
  description:string
  start :string
  end:string
  active:boolean
  drop_rate:number
  legendaris:string
  langka:string
  biasa:string
}

export interface InventoryItem {
  username: string;
  item_name: string;
  images: string;
  rarity: "Legendaris" | "Langka" | "Biasa";
  drop_rate: string | number;
  qty: number;
}

export interface LoginProps{
  result:boolean
  message:string
  username:string
  users:userProps
  
}
export interface userProps{
  user:string
  email:string
  coins:number
  role:string
  rarity:string,
  drop_rate:number
}