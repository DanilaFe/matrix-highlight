import {createContext} from "react";
import {Page, Room} from "../common/model";

export type AppContextState = {
    page: Page;
    currentRoom: Room | null;
    currentUserId: string | null;
};

export const AppContext = createContext<AppContextState>({
    page: new Page({}),
    currentRoom: null,
    currentUserId: null
});
