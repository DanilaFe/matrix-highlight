import {Room} from "../../model";
import {Folder} from "react-feather";
import "./RoomList.scss";

export type RoomListProps = {
    rooms: Room[];
    createRoomEnabled: boolean;
    currentRoomId: string | null;
    onRoomClick(room: string | null): void;
    onCreateRoom(): void;
};

export const RoomList = (props: RoomListProps) => {
    if (props.rooms.length === 0) {
        return (
            <div id="FirstGroupMessage">
                Your highlights are stored in groups. Each group contains its own highlights, and can be shared with other users (or not shared at all).
                <button disabled={!props.createRoomEnabled} className="primary" onClick={props.onCreateRoom}>Create a group!</button>
            </div>
        );
    }
    const rooms = props.rooms.map(r =>
        <div key={r.id} className="room" onClick={() => props.onRoomClick(r.id)}>
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {r.name}
                {props.currentRoomId === r.id ? <span className="room-current">Current</span> : null}
            </div>
            <div className="room-info">
                Users: {r.users.map(u => u.name).join(", ")}
            </div>
        </div>
    );
    return (
        <>
            <h3>Joined Rooms</h3>
            <div className="room-list">{rooms}</div>
        </>
    );
}
