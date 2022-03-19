import {Room} from "../../common/model";
import {Folder} from "react-feather";
import styles from "./InviteList.scss";

export type InviteListProps = {
    invitedRooms: Room[];
    onJoinRoom(id: string): void;
    onIgnoreRoom(id: string): void;
}

const Invite = (props: {room: Room} & Exclude<InviteListProps, "invitedRoom">) => {
    return (
        <div className={styles.room}>
            <div className={styles.roomIcon}><Folder/></div>
            <div className={styles.roomName}>
                {props.room.name}
            </div>
            <div className={styles.roomInfo}>
                Users: {props.room.joinedUsers.map(u => u.name).join(", ")}
                <p>
                    <button className={styles.acceptButton} onClick={() => props.onJoinRoom(props.room.id)}>Accept</button>
                    <button className={styles.rejectButton} onClick={() => props.onIgnoreRoom(props.room.id)}>Reject</button>
                </p>
            </div>
        </div>
    );
}

export const InviteList = (props: InviteListProps) => {
    return (
        <div className={styles.roomList}>
            {props.invitedRooms.map(r => <Invite room={r} {...props}/>)}
        </div>
    );
}
