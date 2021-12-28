import {Page, Room} from "../../common/model";
import {QuoteList} from "./QuoteList";
import {UserList} from "./UserList";
import {Plus, Folder, FolderPlus, Bell, Icon, Settings, AlignLeft, Users, MessageSquare, ArrowLeft} from "react-feather";
import Select from "react-select";
import "./ToolsMenu.scss";
import {useState, ReactElement, PropsWithChildren} from "react";

export type ToolsMenuTab = "create" | "join" | "invites" | "settings" | "users" | "quotes" | "comments" ;

export type ToolsMenuProps = {
    tab: ToolsMenuTab | null;
    createRoomEnabled: boolean;
    onTabClick(tab: ToolsMenuTab | null): void;
    page: Page;
    currentRoom: Room | null;
    onSelectRoom(roomId: string | null): void;
    onCreateRoom(): void;
    onJoinRoom(id: string): void;
    onIgnoreRoom(id: string): void;
    onInviteUser(roomId: string, userId: string): void;
}

const RoomToolbar = (props: { onCreateRoom(): void, onJoinRoom(): void, onInviteOpen(): void, showInvites: boolean }) => {
    return (
        <div className="input-group">
            <button className="labeled-icon-button" onClick={props.onCreateRoom}><Plus className="feather"/>Create room</button>
            <button className="labeled-icon-button" onClick={props.onJoinRoom}><FolderPlus className="feather"/>Join room</button>
            { props.showInvites ? <button className="labeled-icon-button" onClick={props.onInviteOpen}><Bell className="feather"/>View Invites</button> : null }
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

const NavBar = (props: { title: string, currentRoom: Room, onPressBack(): void }) => {
    return (
        <nav>
            <ArrowLeft className="feather" onClick={props.onPressBack}/>
            <div className="nav-text">
                <h1>{props.title}</h1>
                <span>{`For room: "${props.currentRoom.name}"`}</span>
            </div>
        </nav>
    );
}

const RoomItem = (props: PropsWithChildren<{room: Room, onJoinRoom(id: string): void, onIgnoreRoom(id: string): void}>) => {
    return (
        <div className="room">
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {props.room.name}
            </div>
            <div className="room-info">
                Users: {props.room.joinedUsers.map(u => u.name).join(", ")}
                <p>
                    <button className="accept-button" onClick={() => props.onJoinRoom(props.room.id)}>Accept</button>
                    <button className="reject-button" onClick={() => props.onIgnoreRoom(props.room.id)}>Reject</button>
                </p>
            </div>
        </div>
    );
}

const QuoteListView = (props: {currentRoom: Room, onPressBack(): void }) => {
    return (
        <>
            <NavBar title="Quotes" {...props}/>
            <QuoteList highlights={props.currentRoom.highlights}/>
        </>
    );
}

const UserListView = (props: {currentRoom: Room, onPressBack(): void, onInviteUser(roomId: string, userId: string): void }) => {
    return (
        <>
            <NavBar title="Users" {...props}/>
            <UserList {...props}/>
        </>
    );
}

const DefaultView = (props: ToolsMenuProps) => {
    const options = props.page.joinedRooms.map(r => { return { value: r.id, label: r.name, data: r } });
    const defaultOption = props.currentRoom ? { value: props.currentRoom.id, label: props.currentRoom.name } : null;
    return (
        <>
            <h3>Select Room</h3>
            <RoomToolbar onCreateRoom={() => {}} onJoinRoom={() => {}} onInviteOpen={() => props.onTabClick("invites")} showInvites={props.page.invitedRooms.length !== 0}/>
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
            { props.currentRoom ?
                <>
                    <h3>Current Room</h3>
                    <RoomButton icon={Settings} title="Settings" subtitle="Configure room name, description, etc." onClick={() => props.onTabClick("settings")}/>
                    <RoomButton icon={Users} title="Users" subtitle="View or invite users." onClick={() => props.onTabClick("users")}/>
                    <RoomButton icon={AlignLeft} title="Quotes" subtitle="See and discuss what has been highlighted on the page." onClick={() => props.onTabClick("quotes")}/>
                    <RoomButton icon={MessageSquare} title="Comments" subtitle="View conversation about this page." onClick={() => props.onTabClick("comments")}/>
                </> : null }
        </>
    );
}

export const ToolsMenu = (props: ToolsMenuProps) => {
    if (props.page.joinedRooms.length + props.page.invitedRooms.length === 0) {
        return (
            <div className="tools-menu">
                <div id="FirstGroupMessage">
                    Your highlights are stored in rooms. Each rooms contains its own highlights, and can be shared with other users (or not shared at all).
                    <button disabled={!props.createRoomEnabled} className="primary" onClick={props.onCreateRoom}>Create a room!</button>
                </div>
            </div>
        );
    }
    const pressBack = () => props.onTabClick(null);
    let view: ReactElement;
    if (!props.currentRoom) {
        view = <DefaultView {...props}/>;
    } else {
        switch (props.tab) {
            case "quotes": view = <QuoteListView currentRoom={props.currentRoom} onPressBack={pressBack}/>; break;
            case "users": view = <UserListView currentRoom={props.currentRoom} onPressBack={pressBack} onInviteUser={props.onInviteUser}/>; break;
            default: view = <DefaultView {...props}/>;
        }
    }
    return (
        <div className="tools-menu">
            {view}
        </div>
    );
}
