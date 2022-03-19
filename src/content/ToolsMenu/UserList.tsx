import { useState } from "react";
import {User} from "react-feather";
import {useContext} from "react";
import {AppContext} from "../AppContext";
import styles from "./UserList.scss";
import commonStyles from "../../common/common.scss";

export type UserListProps = {
    onInviteUser(roomId: string, userId: string): void;
}

export const UserList = (props: UserListProps) => {
    const [inviteString, setInviteString] = useState("");
    const currentRoom = useContext(AppContext).currentRoom;

    if (!currentRoom) return <></>;

    const users = currentRoom.joinedUsers.map(u =>
        <div key={u.id} className={styles.user}>
            <div className={styles.userIcon}><User/></div>
            <div className={styles.userName}>{u.name}</div>
            <div className={styles.userInfo}>{u.id}</div>
        </div>
    );
    return (
        <div className={styles.usersView}>
            <div className={commonStyles.inputGroup}>
                <input type="text" onChange={e => setInviteString(e.target.value)} placeholder="Enter Matrix IDs of users to invite"/>
                <button onClick={() => props.onInviteUser(currentRoom.id, inviteString)}>Invite</button>
            </div>
            <div className={styles.userList}>
                {users}
            </div>
        </div>
    );
}
