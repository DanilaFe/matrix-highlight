import {useRef} from 'react'
import {NavBar} from './Navbar'

export const JoinRoomView = (props: { onJoinRoom(id: string): void }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    return (
        <>
            <NavBar title="Join Room" subtitle="Enter the room id which you'd like to join"/>
            <form onSubmit={e => {
                e.preventDefault()
                inputRef?.current?.value && props.onJoinRoom(inputRef?.current?.value)
            }} id="CreateRoom">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Room ID"
                    id="join-room-id"/>

                <input type="submit" value="Join" className="primary"/>
            </form>
        </>
    )
}
