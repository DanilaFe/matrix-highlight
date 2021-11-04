import "./UserList.scss";
import {Room} from "../../model";
import {User} from "react-feather";

export type UserListProps = {
    currentRoom: Room | null;   
}

export const UserList = (props: UserListProps) => {
    const users = (props.currentRoom?.users || []).map(u =>
        <div key={u.id} className="user">
            <div className="user-icon"><User/></div>
            <div className="user-name">{u.name}</div>
            <div className="user-info">{u.id}</div>
        </div>
    );
    return (
        <div className="user-list">
            {users}
        </div>
    );
}
