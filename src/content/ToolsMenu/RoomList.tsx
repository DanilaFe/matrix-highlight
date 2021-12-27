import {PropsWithChildren} from "react";
import {Room} from "../../common/model";
import {Folder, FolderPlus, FolderMinus} from "react-feather";
import Select from 'react-select'
import "./RoomList.scss";
import * as variables from "../../common/scss/variables.scss";

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
    const currentRoom = props.joinedRooms.find(r => r.id === props.currentRoomId);
    const defaultOption = currentRoom ? { value: currentRoom.id, label: currentRoom.name, data: currentRoom } : null;
    return (
        <>
            <Select className="room-select" options={options} defaultValue={defaultOption}
                onChange={newValue => props.onRoomClick(newValue?.value || null)}
                styles={{
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#3072c7' : (state.isFocused ? '#cbddf2' : 'white')
                    }),
                    control: (provided, state) => ({
                        ...provided,
                        border: state.menuIsOpen ? '0.08rem solid #3072c7' : '0.08rem solid #cacaca',
                        boxShadow: state.menuIsOpen ? '0px 0px 5px rgba(#3072c7, 0.4)' : 'none',
                    }),
                    menu: (provided, state) => ({
                        ...provided,
                        zIndex: 10000
                    })
                }}/>
        </>
    );
}
