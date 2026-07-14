import { EventIcon, DatabaseIcon, HistoryIcon, SettingsIcon } from "../components/Icons";
import { MenuType } from "./Types";

export const ListMenu = [
    { name: "Events" as MenuType, icon: EventIcon },
    { name: "Item Database" as MenuType, icon: DatabaseIcon },
    { name: "Global History" as MenuType, icon: HistoryIcon },
    { name: "Settings" as MenuType, icon: SettingsIcon },
]