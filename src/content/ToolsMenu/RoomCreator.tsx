import {useState} from "react";
import "./RoomCreator.scss";

export type RoomCreatorProps = {
    createRoomEnabled: boolean;
    onCreateRoom(roomName: string): void;
}

export const RoomCreator = (props: RoomCreatorProps) => {
    const [roomName, setRoomName] = useState(`Highlight room for: ${window.location.href}`);
    return (
        <form onSubmit={e => { e.preventDefault(); props.onCreateRoom(roomName) }} id="CreateRoom">
            <label htmlFor="roomname">Room Name</label>
            <input id="roomname" type="text"
                value={roomName} onChange={e => setRoomName(e.target.value)} disabled={!props.createRoomEnabled}/>
            <input type="submit" value="Create" className="primary" disabled={!props.createRoomEnabled}></input>
        </form>
    );
};
