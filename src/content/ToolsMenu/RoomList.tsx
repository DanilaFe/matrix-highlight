import {PropsWithChildren} from "react";
import {Room} from "../../common/model";
import {Folder, FolderPlus, FolderMinus} from "react-feather";
import Select from 'react-select'
import "./RoomList.scss";

export type RoomListProps = {
    joinedRooms: Room[];
    invitedRooms: Room[];
    createRoomEnabled: boolean;
    currentRoomId: string | null;
    onRoomClick(room: string | null): void;
    onCreateRoom(): void;
    onJoinRoom(roomId: string): void;
    onIgnoreRoom(roomId: string): void;
};

const RoomItem = (props: PropsWithChildren<{room: Room, onClick(): void, current: boolean}>) => {
    return (
        <div className="room" onClick={props.onClick}>
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {props.room.name}
                {props.current ? <span className="room-current">Current</span> : null}
            </div>
            <div className="room-info">
                Users: {props.room.joinedUsers.map(u => u.name).join(", ")}
                { props.children ? <p>{props.children}</p> : <></> }
            </div>
        </div>
    );
}

const RoomToolbar = (props: {}) => {
    return (
        <div className="input-group">
            <button className="labeled-icon-button"><FolderPlus className="feather"/>Add room</button>
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
    const options = props.joinedRooms.map(room => { return { value: room.id, label: room.name, data: room } });
    return (
        <>
            <Select className="room-select" options={options}/>
        </>
    );
}
