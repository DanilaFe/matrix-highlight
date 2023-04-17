import {PublicRoom, Room} from "../../common/model";
import {Folder} from "react-feather";
import "./InviteList.scss";

export type InviteListProps = {
    rooms: Room[];
    suggestedRooms: PublicRoom[];
    onJoinRoom(id: string): void;
}

const Suggestion = (props: {roomId: string, joined: boolean, roomName: string | null} & Exclude<InviteListProps, "suggestedRooms">) => {
    return (
        <div className="room">
            <div className="room-icon"><Folder/></div>
            <div className="room-name">
                {props.roomName || props.roomId}
            </div>
            <div className="room-info">
                No user information available.

                {
                props.joined ? <></> :
                    <p>
                        <button className="accept-button" onClick={() => props.onJoinRoom(props.roomId)}>Join</button>
                    </p>
                }
            </div>
        </div>
    );
}

export const SuggestedList = (props: InviteListProps) => {
    // Assume that rooms are pre-filtered to have names.
    const nonMemberRooms: PublicRoom[] = [];
    const isJoinedRoom = (suggestedRoom : PublicRoom) => {
        return props.rooms.some(room => {
            return room.id === suggestedRoom.id && room.membership === "join"
        });
    };
    return (
        <div className="room-list">
            {props.suggestedRooms.map(room => <Suggestion roomId={room.id} joined={isJoinedRoom(room)} roomName={room.name} {...props}/>)}
        </div>
    );
}
