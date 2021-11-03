import {Room} from "../../model";
import {Folder} from "react-feather";
import "./RoomList.scss";

export type RoomListProps = {
    joinedRooms: Room[];
    invitedRooms: Room[];
    createRoomEnabled: boolean;
    currentRoomId: string | null;
    onRoomClick(room: string | null): void;
    onCreateRoom(): void;
};

const RoomItem = (props: {room: Room, onClick(): void, current: boolean}) => {
    return (
        <div className="room" onClick={props.onClick}>
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {props.room.name}
                {props.current ? <span className="room-current">Current</span> : null}
            </div>
            <div className="room-info">
                Users: {props.room.users.map(u => u.name).join(", ")}
            </div>
        </div>
    );
}

export const RoomList = (props: RoomListProps) => {
    if (props.joinedRooms.length + props.invitedRooms.length === 0) {
        return (
            <div id="FirstGroupMessage">
                Your highlights are stored in groups. Each group contains its own highlights, and can be shared with other users (or not shared at all).
                <button disabled={!props.createRoomEnabled} className="primary" onClick={props.onCreateRoom}>Create a group!</button>
            </div>
        );
    }
    const rooms = props.joinedRooms.map(r => <RoomItem key={r.id} room={r} current={r.id === props.currentRoomId} onClick={() => props.onRoomClick(r.id)}/>);
    const invites = props.invitedRooms.map(r => <RoomItem key={r.id} room={r} current={false} onClick={() => {}}/>);
    return (
        <>
            { rooms.length === 0 ? <></> : <><h3>Joined Rooms</h3><div className="room-list">{rooms}</div></> }
            { invites.length === 0 ? <></> : <><h3>Invited Rooms</h3><div className="room-list">{invites}</div></> }
        </>
    );
}
