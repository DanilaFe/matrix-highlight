import {Page} from "../../model/Page";
import {Tab,Tabs} from "../../utils/Tabs";
import {QuoteList} from "./QuoteList";
import {RoomList} from "./RoomList";

export type ToolsMenuTab = "quotes" | "rooms" | "users";

export type ToolsMenuProps = {
    modeId: string;
    tab: ToolsMenuTab;
    onTabClick(tab: ToolsMenuTab): void;
    page: Page;
    currentRoomId: string | null;
    onRoomSwitch(roomId: string | null): void;
    onCreateRoom(): void;
}

export const ToolsMenu = (props: ToolsMenuProps) => {
    const currentRoom = props.page.getRoom(props.currentRoomId);
    return (
        <Tabs currentTab={props.tab} onTabClick={props.onTabClick}>
            <Tab tabId="quotes" tabTitle="Quotes">
                {currentRoom ? <QuoteList highlights={currentRoom.highlights}/> : null}
            </Tab>
            <Tab tabId="rooms" tabTitle="Rooms">
                <RoomList rooms={props.page.rooms} currentRoomId={props.currentRoomId} onRoomClick={props.onRoomSwitch} onCreateRoom={props.onCreateRoom}/>
            </Tab>
            <Tab tabId="users" tabTitle="Users"></Tab>
        </Tabs>
    );
}
