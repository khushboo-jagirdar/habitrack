import { useEffect, useMemo, useState } from 'react'
import './chat.scss'
import { createThread, fetchThread, fetchThreads, sendMessage } from '../../lib/chatApi'
import { useAuth } from '../../context/AuthContext'

function Chat() {
    const [threads, setThreads] = useState([])
    const [activeThreadId, setActiveThreadId] = useState(null)
    const [activeThread, setActiveThread] = useState(null)
    const [messageText, setMessageText] = useState('')
    const [newRecipient, setNewRecipient] = useState('')
    const [newMessage, setNewMessage] = useState('')
    const [error, setError] = useState('')

    const { user: authUser } = useAuth()
    const user = useMemo(() => {
        if (!authUser) return null;
        return { ...authUser, id: authUser.id || authUser._id };
    }, [authUser])

    const apiBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
      : ''

    useEffect(() => {
        if (!user?.id) return
        fetchThreads(user.id)
            .then((data) => {
                setThreads(data)
                if (data.length > 0) {
                    setActiveThreadId(data[0].id)
                }
            })
            .catch((err) => setError(err.message || 'Failed to load chats'))
    }, [user?.id])

    useEffect(() => {
        if (!activeThreadId) return
        fetchThread(activeThreadId)
            .then(setActiveThread)
            .catch((err) => setError(err.message || 'Failed to load chat'))
    }, [activeThreadId])

    const handleSend = async () => {
        if (!messageText.trim() || !user?.id || !activeThreadId) return
        setError('')
        try {
            await sendMessage({ threadId: activeThreadId, senderId: user.id, text: messageText.trim() })
            const updated = await fetchThread(activeThreadId)
            setActiveThread(updated)
            setMessageText('')
        } catch (err) {
            setError(err.message || 'Failed to send message')
        }
    }

    const handleNewChat = async (e) => {
        e.preventDefault()
        if (!newRecipient.trim() || !newMessage.trim() || !user?.id) return
        setError('')
        try {
            const thread = await createThread({ senderId: user.id, recipientEmail: newRecipient.trim(), text: newMessage.trim() })
            const updatedThreads = await fetchThreads(user.id)
            setThreads(updatedThreads)
            setActiveThreadId(thread.id)
            setNewRecipient('')
            setNewMessage('')
        } catch (err) {
            setError(err.message || 'Failed to start chat')
        }
    }

    const getOtherParticipant = (thread) => {
        const participants = thread?.participants || []
        return participants.find(p => String(p._id || p.id) !== String(user?.id)) || participants[0]
    }

    return (
        <div className="chat">
            <div className="messages">
                <h1>Messages</h1>
                {error && <div className="chatError">{error}</div>}

                <form className="newChat" onSubmit={handleNewChat}>
                    <input
                        type="email"
                        placeholder="Recipient email"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        required
                    />
                    <button type="submit">Start</button>
                </form>

                {threads.length === 0 && (
                    <div className="emptyState">No conversations yet.</div>
                )}

                {threads.map(thread => {
                    const other = getOtherParticipant(thread)
                    const avatar = other?.avatar
                      ? (other.avatar.startsWith('/uploads') ? `${apiBase}${other.avatar}` : other.avatar)
                      : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmgRRWWJoxWiRu5d3_NP3vVJNGIuRIlEjsPg&s"
                    return (
                        <div
                            className={`message ${thread.id === activeThreadId ? 'active' : ''}`}
                            key={thread.id}
                            onClick={() => setActiveThreadId(thread.id)}
                        >
                            <img src={avatar} alt="" />
                            <span>{other?.fullName || 'User'}</span>
                            <p>{thread.lastMessage?.text || 'No messages yet'}</p>
                        </div>
                    )
                })}
            </div>
            {activeThread && (
                <div className="chatBox">
                    <div className="top">
                        <div className="user">
                            {(() => {
                                const other = getOtherParticipant(activeThread)
                                const avatar = other?.avatar
                                  ? (other.avatar.startsWith('/uploads') ? `${apiBase}${other.avatar}` : other.avatar)
                                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmgRRWWJoxWiRu5d3_NP3vVJNGIuRIlEjsPg&s"
                                return (
                                    <>
                                        <img src={avatar} alt="" />
                                        {other?.fullName || 'User'}
                                    </>
                                )
                            })()}
                        </div>
                        <div className="close" onClick={() => setActiveThreadId(null)}>X</div>
                    </div>
                    <div className="center">
                        {activeThread.messages?.map(msg => (
                            <div key={msg.id} className={`chatMessage ${String(msg.senderId) === String(user?.id) ? 'own' : ''}`}>
                                <p>{msg.text}</p>
                                <span>{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bottom">
                        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat
