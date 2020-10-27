import { useEffect, useRef, useState } from 'react';
import DownArrowIcon from '../assets/icons/arrow-down-circle-fill.svg';

const Chat = ({ messages, sendMessage, socket }) => {
	const [message, setMessage] = useState('');
	const [newMessagePopup, setNewMessagePopup] = useState(false);
    const chatContainerRef = useRef(null);
	
	const scrollToBottom = (force = false) => {
		const chatContainer = chatContainerRef.current;
		const { scrollHeight, scrollTop, offsetHeight } = chatContainer;
		chatContainer.maxScrollTop = scrollHeight - offsetHeight;

		if (chatContainer.maxScrollTop - scrollTop <= offsetHeight || force) {
			chatContainer.scroll(0, scrollHeight);
		} else setNewMessagePopup(true);
	};

	useEffect(() => scrollToBottom(), [messages]);

	useEffect(() => {
		const chatContainer = chatContainerRef.current;
		const { scrollHeight, offsetHeight, scrollTop } = chatContainer;

		if (scrollTop === (scrollHeight - offsetHeight) && newMessagePopup) {
			setNewMessagePopup(false);
		};
	}, [newMessagePopup]);

	useEffect(() => {
		const chatContainer = chatContainerRef.current;

		const userScrolledToEnd = () => {
			const { scrollHeight, offsetHeight, scrollTop } = chatContainer;
			const containerHeight = scrollHeight - offsetHeight;

			if (containerHeight <= scrollTop && newMessagePopup) {
				setNewMessagePopup(false);
			};
		};

		chatContainerRef.current.addEventListener('scroll', userScrolledToEnd, false);

		return () => chatContainer.removeEventListener('scroll', userScrolledToEnd, false);
	}, [newMessagePopup])


	const handleSeeNewMessages = () => {
		scrollToBottom(true);
		setNewMessagePopup(false);
	};

	const handleOnChangeMessage = (e) => setMessage(e.target.value);
	const handleOnKeyDown = (e) => {
        if (e.keyCode === 13) handleSendMessage(e);
	};

	const handleSendMessage = (e) => {
		e.preventDefault();
        if (!socket || message.trim() === '') return;
        sendMessage(message);
		scrollToBottom(true);
		setMessage('');
    };
	
	return (
        <div className='chat-container'>
            <div className='messages-container' ref={chatContainerRef}>
                {messages.map(({ type, content, username, id: authorId }, index) => (
                    <div
                        className={
                            type === 'SERVER-USER_JOINED'
                                ? 'SERVER-USER_JOINED message'
                                : type === 'SERVER-USER_LEFT'
                                ? 'SERVER-USER_LEFT message'
                                : type === 'NEW_NEW_DRAWER'
                                ? 'NEW_NEW_DRAWER message'
                                : 'message'
                        }
                        key={index}
                    >
                        {type === 'SERVER-USER_JOINED' ||
                        type === 'SERVER-USER_LEFT' ||
                        type === 'NEW_NEW_DRAWER' ? null : (
                            <h4 className='message-author' data-you={authorId === socket?.id}>
                                {username}
                            </h4>
                        )}
                        <p className='message-content'>{content}</p>
                    </div>
                ))}
            </div>
            {newMessagePopup && (
                <span className='new-messages-banner' onClick={handleSeeNewMessages}>
                    New messages <img src={DownArrowIcon} alt='Scroll down' />{' '}
                </span>
            )}
            <div className='send-message-input-container'>
                <input
                    type='text'
                    value={message}
                    onChange={handleOnChangeMessage}
                    onKeyDown={handleOnKeyDown}
                    placeholder='Say something'
                />
            </div>
        </div>
	);
};

export default Chat;