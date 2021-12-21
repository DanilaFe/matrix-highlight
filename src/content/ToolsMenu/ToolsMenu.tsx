import {Page} from "../../common/model/Page";
import {Tab,Tabs} from "../../common/utils/Tabs";
import {QuoteList} from "./QuoteList";
import {RoomList} from "./RoomList";
import {UserList} from "./UserList";

export type ToolsMenuTab = "quotes" | "rooms" | "users";

export type ToolsMenuProps = {
    tab: ToolsMenuTab;
    createRoomEnabled: boolean;
    onTabClick(tab: ToolsMenuTab): void;
    page: Page;
    currentRoomId: string | null;
    onRoomSwitch(roomId: string | null): void;
    onCreateRoom(): void;
    onJoinRoom(id: string): void;
    onIgnoreRoom(id: string): void;
    onInviteUser(roomId: string, userId: string): void;
}

export const ToolsMenu = (props: ToolsMenuProps) => {
    const currentRoom = props.page.getRoom(props.currentRoomId);
    return (
        <Tabs currentTab={props.tab} onTabClick={props.onTabClick}>
            <Tab tabId="quotes" tabTitle="Quotes">
                {currentRoom ? <QuoteList highlights={currentRoom.highlights}/> : null}
            </Tab>
            <Tab tabId="rooms" tabTitle="Rooms">
                <RoomList joinedRooms={props.page.joinedRooms} invitedRooms={props.page.invitedRooms} onRoomClick={props.onRoomSwitch} {...props}/>
            </Tab>
            <Tab tabId="users" tabTitle="Users">
                <UserList currentRoom={props.page.getRoom(props.currentRoomId)} {...props}/>
            </Tab>
        </Tabs>
    );
}
