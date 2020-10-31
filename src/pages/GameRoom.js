import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';
import Timer from 'react-timer-wrapper';
import Timecode from 'react-timecode';

import Chat from '../components/Chat';
import Canvas from '../components/Room/Canvas';
import DrawerTools from '../components/Room/DrawerTools/DrawerTools';
import UsersList from '../components/Room/UsersList';
import ChooseWordModal from '../components/Modal/ChooseWordModal';


const socketURL = 'http://localhost:5000';

// const mockMessages = [
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
//     { username: 'Test', content: 'Hello, it\'s me!', id: 2313213 },
// ];

class GameRoom extends Component{
    constructor(){
        super();
        this.state = {
            drawer: null,
            users: [],
            messages: [],
            context: null,
            drawing: false,
            tool: 'Pencil',
            width: null, 
            height: null,
            pencilSize: 2,
            pencilColor: '#000000', 
            x: null, 
            y: null, 
            prevX: null, 
            prevY: null,
            duration: 90000,
            isTimerActive: false,
            time: 0,
            word: null
        }
    };
    
    componentDidMount() {
        const { isAuthorized, history } = this.props;
        if (!isAuthorized) return history.push('/join');
        
        this.setUpCanvas();
    };
    
    componentWillUnmount() {  
        if (this.state.socket) {
            this.state.socket.removeAllListeners();
        };
    };

    setUpCanvas = () => {
        let width = this.canvasContainer.offsetWidth;
        let height = this.canvasContainer.offsetHeight;
        this.setState({ context: this.canvas.getContext('2d'), width, height })
        this.canvas.width = width;
        this.canvas.height = height;
        this.connect();
    };

    connect = () => {
        const socket = io(socketURL);
        this.setState({ socket });
        this.onSocketMethods(socket);
    };

    onSocketMethods = (socket) => {
        const { roomID, username, userCharacter } = this.props;
        const { context, width, height } = this.state;
        
        socket.on('connect', () => {
			socket.emit('JOIN_GAME_ROOM', { roomID, username, userCharacter });
		});
        
        socket.on('GET_USERS', (users) => this.setState({ users }));

        socket.on('SET_DRAWER', (drawer) => this.setState({ drawer }));

        socket.on('SET_WORD', (word) => {
            this.setState({ word, isTimerActive: true });
        });

        socket.on('NEW_ROUND', () => {
            this.setState({ isTimerActive: false, word: null, duration: 90000, time: 0 });
        });

        socket.on('GET_CANVAS', (canvas) => {
            for(let i = 0; i < canvas.length; i++){
                this.handleDrawLine(canvas[i].x1, canvas[i].y1, canvas[i].x2, canvas[i].y2, canvas[i].pencilColor, canvas[i].pencilSize);
            };
        });

        socket.on('DRAW', (data) => {
            this.handleDrawLine(data.x1, data.y1, data.x2, data.y2, data.pencilColor, data.pencilSize);
        });

        socket.on('CLEAR_CANVAS', () => {
            context.clearRect(0, 0, width, height)
        });

        socket.on('MESSAGE', (data) => this.setMessages(data));

        socket.on('USER_LEFT', (users) =>{
            this.setState({ users });
        });
    };
    
    handleStartDrawing = () => {
        if (this.state.tool === 'Paint Bucket') return;
        this.setState({ drawing: true, prevX: this.state.x, prevY: this.state.y });
    };

    handleDrawing = (e) => {
        const { drawing, prevX, prevY, tool, pencilColor, pencilSize, socket } = this.state;

        if (tool === 'Paint Bucket') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.setState({ x, y });

        if (drawing) {
            
            if (tool === 'Pencil') {
                this.handleDrawLine(prevX, prevY, x, y, pencilColor, pencilSize);
            } else if (tool === 'Eraser') {
                this.handleEraseCanvas(prevX, prevY, x, y);
            };
            
            this.setState({ prevX: x, prevY: y });
            socket.emit('DRAW', {
                'x1': prevX,
				'y1': prevY,
				'x2': x,
                'y2': y,
                pencilColor,
                pencilSize,
            });
        };
    };

    handleEndDrawing = () => {
        this.setState({ drawing: false });
    };

    handleDrawLine = (x1, y1, x2, y2, pencilColor, pencilSize) => {
        const context = this.state.context;

        if (!context) return;

        context.globalCompositeOperation = 'source-over';
        context.strokeStyle = pencilColor;

        this.setState({ context: context }, () => {
            const { context } = this.state;
            context.beginPath();        
            context.lineWidth = pencilSize;
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);    
            context.stroke();
            context.closePath();
        });
    };

    handleEraseCanvas = (prevX, prevY, x, y) => {
        const context = this.state.context;

        if (!context) return;
        
        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(x, y, 10, 0, 2 * Math.PI);
        context.fill();
    
        context.lineWidth = 20;
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);
        context.stroke();
    };

    handleClearCanvas = () => {
        this.state.socket.emit('CLEAR_CANVAS');
        this.state.context.clearRect(0, 0, this.state.width, this.state.height);
    };

    handleOnChangePencilSize = (e) =>{
        const value = e.target.value;
        this.setState({ pencilSize: value });
    };

    handleChangeColor = (color) => this.setState({ pencilColor: color });

    handleUseBucket = () => {
        const { context, width, height, pencilColor } = this.state;

        context.fillStyle = pencilColor;
        context.fillRect(0, 0, width, height);
        this.setState({ context });
    };

    setMessages = (data) => {
		this.setState({
			messages: [
				...this.state.messages,
				{
					username: data.username,
					content: data.content,
					type: data.type,
					id: data.id,
				},
			],
		});
    };
    
    sendMessage = (message) => {
		this.state.socket.emit('SEND_MESSAGE', {
			content: message,
			username: this.props.username,
		});
    };

    handleChangeTool = (tool) => {
        this.setState({ tool });

        if (tool === 'Pencil') {
            this.setState({ pencilSize: '2' });
        };
    };

    onTimerStart = ({duration, progress, time}) => {
        console.log('Started', duration);
    };
   
    onTimerStop = ({duration, progress, time}) => {
        console.log('Stopped', duration);
    };
   
    onTimerUpdate = ({duration, time}) => this.setState({ time, duration });
   
    onTimerFinish = ({duration, progress, time}) => {
        console.log('Finished', duration);
    };  

    handleChooseWord = (word) => {
        const splitWord = word.split('');

        const hiddenWord = [];
        splitWord.forEach(() => hiddenWord.push('_'));

        this.state.socket.emit('SET_WORD', word);
    };

    render() {
        const { socket, context, users, pencilSize, messages, tool, time, duration, isTimerActive, word, drawer } = this.state;

        return(
            <div className='room-page'>
                <h2 className='word'>
                    {word}
                </h2>
                <div className='timer-container'>
                    <Timer active={isTimerActive} 
                        duration={90000}
                        onTimeUpdate={this.onTimerUpdate}
                        onFinish={this.onTimerFinish}
                        onStart={this.onTimerStart}
                        onStop={this.onTimerStop}
                    />
                    <Timecode time={duration - time} />
                </div>
                <div className='room-children-container'>
                    <UsersList users={users} />
                    <Canvas 
                        handleStartDrawing={this.handleStartDrawing} 
                        handleEndDrawing={this.handleEndDrawing} 
                        handleDrawing={this.handleDrawing}
                        handleUseBucket={this.handleUseBucket}
                        canvas={(node) => { this.canvas = node }}
                        canvasContainer={(node) => { this.canvasContainer = node }}
                        tool={tool}
                        context={context}
                    />
                    <div className='sidebar_second'>
                        <DrawerTools 
                            handleOnChangePencilSize={this.handleOnChangePencilSize} 
                            pencilSize={pencilSize} 
                            handleChangeColor={this.handleChangeColor}
                            handleClearCanvas={this.handleClearCanvas}
                            handleChangeTool={this.handleChangeTool}
                            tool={tool}
                        />
                        <Chat 
                            socket={socket} 
                            messages={messages} 
                            sendMessage={this.sendMessage} 
                        />
                    </div>
                </div>
                {socket && socket.id === drawer && !isTimerActive && (
							<ChooseWordModal handleChooseWord={this.handleChooseWord} />
						)}
            </div>
        )
    }
}

export default withRouter(GameRoom);