import {Room} from "../../common/model";
import {Plus, FolderPlus, Icon, Settings, Users, AlignLeft, MessageSquare, Bell} from "react-feather";
import Select from 'react-select'
import "./RoomList.scss";

export type RoomListProps = {
    joinedRooms: Room[];
    invitedRooms: Room[];
    createRoomEnabled: boolean;
    currentRoomId: string | null;
    onSelectRoom(room: string | null): void;
    onCreateRoom(): void;
    onJoinRoom(roomId: string): void;
    onIgnoreRoom(roomId: string): void;
};

/* const RoomItem = (props: PropsWithChildren<{room: Room, onJoinRoom(id: string): void, onIgnoreRoom(id: string): void}>) => {
    return (
        <div className="room">
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {props.room.name}
            </div>
            <div className="room-info">
                Users: {props.room.joinedUsers.map(u => u.name).join(", ")}
                <p>
                    <button className="accept-button" onClick={() => props.onJoinRoom(r.id)}>Accept</button>
                    <button className="reject-button" onClick={() => props.onIgnoreRoom(r.id)}>Reject</button>
                </p>
            </div>
        </div>
    );
} */
// const invites = props.joinedRooms.map(r => <RoomItem key={r.id} room={r} onJoinRoom={props.onJoinRoom} onIgnoreRoom={props.onIgnoreRoom}/>);
// { currentRoom ? <><h3>Quotes</h3><QuoteList highlights={currentRoom.highlights}/></> : undefined }

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

export const RoomList = (props: RoomListProps) => {
    if (props.joinedRooms.length + props.invitedRooms.length === 0) {
        return (
            <div id="FirstGroupMessage">
                Your highlights are stored in rooms. Each rooms contains its own highlights, and can be shared with other users (or not shared at all).
                <button disabled={!props.createRoomEnabled} className="primary" onClick={props.onCreateRoom}>Create a room!</button>
            </div>
        );
    }
    const options = props.joinedRooms.map(r => { return { value: r.id, label: r.name, data: r } });
    const currentRoom = props.joinedRooms.find(r => r.id === props.currentRoomId);
    const defaultOption = currentRoom ? { value: currentRoom.id, label: currentRoom.name, data: currentRoom } : null;
    return (
        <>
            <h3>Select Room</h3>
            <RoomToolbar onCreateRoom={() => {}} onJoinRoom={() => {}} onInviteOpen={() => {}} showInvites={props.invitedRooms.length !== 0}/>
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
            <h3>Current Room</h3>
            <RoomButton icon={Settings} title="Settings" subtitle="Configure room name, description, etc." onClick={() => {}}/>
            <RoomButton icon={Users} title="Users" subtitle="View or invite users." onClick={() => {}}/>
            <RoomButton icon={AlignLeft} title="Quotes" subtitle="See and discuss what has been highlighted on the page." onClick={() => {}}/>
            <RoomButton icon={MessageSquare} title="Comments" subtitle="View conversation about this page." onClick={() => {}}/>
        </>
    );
}
