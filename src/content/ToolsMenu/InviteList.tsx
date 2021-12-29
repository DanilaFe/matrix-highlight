import {Room} from "../../common/model";
import {Folder} from "react-feather";
import "./InviteList.scss";

export type InviteListProps = {
    invitedRooms: Room[];
    onJoinRoom(id: string): void;
    onIgnoreRoom(id: string): void;
}

const Invite = (props: {room: Room} & Exclude<InviteListProps, "invitedRoom">) => {
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

export const InviteList = (props: InviteListProps) => {
    return (
        <div className="room-list">
            {props.invitedRooms.map(r => <Invite room={r} {...props}/>)}
        </div>
    );
}
