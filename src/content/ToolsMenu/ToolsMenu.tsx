import {QuoteList} from "./QuoteList";
import {UserList} from "./UserList";
import {InviteList} from "./InviteList";
import {Plus, FolderPlus, Bell, Icon, Settings, AlignLeft, Users, MessageSquare} from "react-feather";
import Select from "react-select";
import "./ToolsMenu.scss";
import {useContext} from "react";
import {AppContext} from "../AppContext";
import {ToolsMenuContext} from "./ToolsMenuContext";
import {NavBar, RoomNavBar} from "./Navbar";

export type ToolsMenuTab = "create" | "join" | "invites" | "settings" | "users" | "quotes" | "comments" ;

export type ToolsMenuProps = {
    createRoomEnabled: boolean;
    onSelectRoom(roomId: string | null): void;
    onCreateRoom(): void;
    onJoinRoom(id: string): void;
    onIgnoreRoom(id: string): void;
    onInviteUser(roomId: string, userId: string): void;
}

const RoomToolbar = () => {
    const { openTab, showInvites } = useContext(ToolsMenuContext);
    return (
        <div className="input-group">
            <button className="labeled-icon-button" onClick={() => openTab("create")}><Plus className="feather"/>Create room</button>
            <button className="labeled-icon-button" onClick={() => openTab("join")}><FolderPlus className="feather"/>Join room</button>
            { showInvites ? <button className="labeled-icon-button" onClick={() => openTab("invites")}><Bell className="feather"/>View Invites</button> : null }
        </div>
    );
};

const RoomButton = (props: {title: string, subtitle: string, icon: Icon, onClick(): void }) => {
    const MyIcon = props.icon;
    return (
        <div className="menu-button" onClick={props.onClick}>
            <div className="menu-button-icon"><MyIcon/></div>
            <div className="menu-button-title">{props.title}</div>
            <div className="menu-button-subtitle">{props.subtitle}</div>
        </div>
    );
};

const InviteView = (props: { onJoinRoom(id: string): void, onIgnoreRoom(id: string): void }) => {
    const {page} = useContext(AppContext);
    return (
        <>
            <NavBar title="Invites" subtitle="Invites are shown only for the current page."/>
            <InviteList invitedRooms={page.invitedRooms} onJoinRoom={props.onJoinRoom} onIgnoreRoom={props.onIgnoreRoom}/>
        </>
    );
}

const QuoteListView = () => {
    return <><RoomNavBar title="Quotes"/><QuoteList/></>;
}

const UserListView = (props: { onInviteUser(roomId: string, userId: string): void }) => {
    return <><RoomNavBar title="Users"/><UserList onInviteUser={props.onInviteUser}/></>;
}
const NoRoomsView = () => {
    return (
        <div id="FirstGroupMessage">
            Your highlights are stored in rooms. Each rooms contains its own highlights,
            and can be shared with other users (or not shared at all).
            <RoomToolbar/>
        </div>
    );
}

const DefaultView = (props: ToolsMenuProps) => {
    const {page, currentRoom} = useContext(AppContext);
    const {openTab} = useContext(ToolsMenuContext);
    const options = page.joinedRooms.map(r => { return { value: r.id, label: r.name, data: r } });
    const defaultOption = currentRoom ? { value: currentRoom.id, label: currentRoom.name } : null;
    return (
        <>
            <h3>Select Room</h3>
            <RoomToolbar/>
            <Select className="room-select" options={options} defaultValue={defaultOption}
                onChange={newValue => props.onSelectRoom(newValue?.value || null)}
                styles={{
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#3072c7' : (state.isFocused ? '#cbddf2' : 'white')
                    }),
                    control: (provided, state) => ({
                        ...provided,
                        border: state.menuIsOpen ? '0.08rem solid #3072c7' : '0.08rem solid #cacaca',
                        boxShadow: state.menuIsOpen ? '0px 0px 5px rgba(#3072c7, 0.4)' : 'none',
                    }),
                    menu: (provided, state) => ({
                        ...provided,
                        zIndex: 10000
                    })
                }}/>
            { currentRoom ?
                <>
                    <h3>Current Room</h3>
                    <RoomButton icon={Settings} title="Settings" subtitle="Configure room name, description, etc." onClick={() => openTab("settings")}/>
                    <RoomButton icon={Users} title="Users" subtitle="View or invite users." onClick={() => openTab("users")}/>
                    <RoomButton icon={AlignLeft} title="Quotes" subtitle="See and discuss what has been highlighted on the page." onClick={() => openTab("quotes")}/>
                    <RoomButton icon={MessageSquare} title="Comments" subtitle="View conversation about this page." onClick={() => openTab("comments")}/>
                </> : null }
        </>
    );
}

const ToolView = (props: ToolsMenuProps) => {
    const {tab} = useContext(ToolsMenuContext);
    const {currentRoom, page} = useContext(AppContext);

    if (page.joinedRooms.length + page.invitedRooms.length === 0) {
        return <NoRoomsView/>;
    } else if (tab === "invites") {
        return <InviteView onJoinRoom={props.onJoinRoom} onIgnoreRoom={props.onIgnoreRoom}/>;
    } else if (currentRoom && tab === "quotes") {
        return <QuoteListView/>;
    } else if (currentRoom && tab === "users") {
        return <UserListView onInviteUser={props.onInviteUser}/>; 
    }
    return <DefaultView {...props}/>;
}

export const ToolsMenu = (props: ToolsMenuProps) => {
    return <div className="tools-menu"><ToolView {...props}/></div>;
}
