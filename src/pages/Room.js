import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from '../components/Chat';
import Canvas from '../components/Room/Canvas';

import DrawerTools from '../components/Room/DrawerTools/DrawerTools';
import UsersList from '../components/Room/UsersList';

const socketURL = 'http://localhost:5000';

class Draw extends Component{
    constructor(){
        super();
        this.state = {
            socket: null,
            users: [],
            messages: [],
            drawing: false,
            context: null,
            width: null, 
            height: null,
            pencilSize: 1,
            pencilColor: '#000000', 
            x: null, 
            y: null, 
            prevX: null, 
            prevY: null
        }
    }

    componentDidMount() {
        const { authorized, history } = this.props;
        if (!authorized) return history.push('/join');
        
        this.setUpCanvas();
    };
    
    componentWillUnmount() {  
		if (this.state.socket) {
			this.state.socket.removeAllListeners();
			this.props.setAuthorized(false);
		};
    };

    setUpCanvas = () => {
        // let width = window.innerWidth;
        // let height = window.innerHeight;
        console.log('Parent size', this.canvasContainer.offsetWidth, this.canvasContainer.offsetHeight);
        let width = this.canvasContainer.offsetWidth;
        let height = this.canvasContainer.offsetHeight;
        this.setState({ context:this.canvas.getContext('2d'), width, height })
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
        
        console.log('Test');
        console.log('id', socket);

        const { roomName, username } = this.props;
        const { context, width, height } = this.state;

        console.log(this.props);
        
        socket.on('connect', () => {
			socket.emit('JOIN', { roomName, username });
		});
        
        socket.on('GET_USERS', (users) => {
            console.log('New User Connected');
            this.setState({ users });
        });

        socket.on('SET_DRAWER', (drawer) => {
            console.log('New User Connected');
            this.setState({ drawer });
        });

        socket.on('GET_CANVAS', (canvas) => {
            console.log('Canvas', canvas);
            for(let i = 0; i < canvas.length; i++){
                this.handleDrawLine(canvas[i].x1, canvas[i].y1, canvas[i].x2, canvas[i].y2, canvas[i].pencilColor, canvas[i].pencilSize);
            };
        });

        socket.on('DRAW', (data) => {
            this.handleDrawLine(data.x1, data.y1, data.x2, data.y2, data.pencilColor, data.pencilSize);
        });

        socket.on('ERASE_CANVAS', () => {
            context.clearRect(0, 0, width, height)
        });

        socket.on('RESIZED', (board)=>{
            for(let i = 0; i < board.length; i++){
                this.handleDrawLine(board[i].x1, board[i].y1, board[i].x2, board[i].y2, board[i].pencilColor, board[i].pencilSize);
            }
        });

        socket.on('MESSAGE', (data) => this.setMessages(data));

        socket.on('USER_LEFT', (users) =>{
            this.setState({ users });
        });
        
        window.addEventListener('resize', () => {
            console.log('Resizing');
        }, false)        
    };
    
    handleStartDrawing = () => {
        console.log('Started Drawing');
        this.setState({ drawing: true, prevX: this.state.x, prevY: this.state.y });
    };

    drawing = (e) => {
        const { drawing, prevX, prevY, pencilColor, pencilSize, socket } = this.state;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.setState({ x, y });

        if (drawing) {
            console.log('Drawing', x, y);

            this.handleDrawLine(prevX, prevY, x, y, pencilColor, pencilSize);
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

    handleEndDrawing = (e) => {
        console.log('Stopped Drawing');
        this.setState({ drawing: false });
    };

    handleDrawLine = (x1, y1, x2, y2, pencilColor, pencilSize) => {
        let newcontext = this.state.context;

        newcontext.strokeStyle = pencilColor;
        newcontext.lineWidth = pencilSize;

        this.setState({context:newcontext}, () => {
            const { context } = this.state;
            context.beginPath();        
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);    
            context.stroke();
            context.closePath();
        });
    };

    handleEraseCanvas = () => {
        this.state.socket.emit('ERASE_CANVAS');
        this.state.context.clearRect(0, 0, this.state.width, this.state.height);
    };

    handleOnChangePencilSize = (e) =>{
        const value = e.target.value;
        this.setState({ pencilSize: value });
    };

    handleChangeColor = (pencilColor) => {
        this.setState({ pencilColor });
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

    render(){
        const { users, pencilSize, messages } = this.state;

        return(
            <div className='room-page'>
                <div>
                    <UsersList users={users} />
                    <Canvas 
                        handleStartDrawing={this.handleStartDrawing} 
                        handleEndDrawing={this.handleEndDrawing} 
                        drawing={this.drawing}
                        canvas={(node) => { this.canvas = node }}
                        canvasContainer={(node) => { this.canvasContainer = node }}
                    />
                    <div className='sidebar_second'>
                        <DrawerTools 
                            handleOnChangePencilSize={this.handleOnChangePencilSize} 
                            pencilSize={pencilSize} 
                            handleEraseCanvas={this.handleEraseCanvas}
                        />
                        <Chat messages={messages} />
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Draw);