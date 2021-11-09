import { useState } from "react";
import "./UserList.scss";
import {Room} from "../model";
import {User} from "react-feather";

export type UserListProps = {
    currentRoom: Room | null;   
    onInviteUser(roomId: string, userId: string): void;
}

export const UserList = (props: UserListProps) => {
    const [inviteString, setInviteString] = useState("");
    
    const currentRoom = props.currentRoom;
    if (!currentRoom) return <></>;

    const users = currentRoom.joinedUsers.map(u =>
        <div key={u.id} className="user">
            <div className="user-icon"><User/></div>
            <div className="user-name">{u.name}</div>
            <div className="user-info">{u.id}</div>
        </div>
    );
    return (
        <div className="users-view">
            <div className="input-group">
                <input type="text" onChange={e => setInviteString(e.target.value)} placeholder="Enter Matrix IDs of users to invite"/>
                <button onClick={() => props.onInviteUser(currentRoom.id, inviteString)}>Invite</button>
            </div>
            <div className="user-list">
                {users}
            </div>
        </div>
    );
}
