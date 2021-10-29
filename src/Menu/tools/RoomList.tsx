import {Room} from "../../model";
import {Folder} from "react-feather";
import "./RoomList.scss";

export type RoomListProps = {
    rooms: Room[];
    currentRoomId: string | null;
    onRoomClick(room: Room): void;
};

export const RoomList = (props: RoomListProps) => {
    const rooms = props.rooms.map(r =>
        <div key={r.id} className="room" onClick={() => props.onRoomClick(r)}>
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {r.name}
                {props.currentRoomId === r.id ? <span className="room-curren"/> : null}
            </div>
            <div className="room-info">
                Users: {r.users.map(u => u.name).join("")}
            </div>
        </div>
    );
    return <div className="room-list">{rooms}</div>;
}
