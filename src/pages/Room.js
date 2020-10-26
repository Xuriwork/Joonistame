import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';

import PainterTools from '../components/Room/PainterTools/PainterTools';
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
            brushSize: 1,
            brushColor: '#000000', 
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
        const socket = io(socketURL);
        this.setState({ socket });
        this.onSocketMethods(socket);
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
        console.log('Parent size', this.canvasContain.offsetWidth, this.canvasContain.offsetHeight);
        let width = this.canvasContain.offsetWidth;
        let height = this.canvasContain.offsetHeight;
        this.setState({ context:this.canvas.getContext('2d'), width, height })
        this.canvas.width = width;
        this.canvas.height = height;
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
                this.handleDrawLine(canvas[i].x1, canvas[i].y1, canvas[i].x2, canvas[i].y2, canvas[i].brushColor, canvas[i].brushSize);
            };
        });

        socket.on('DRAW', (data) => {
            this.handleDrawLine(data.x1, data.y1, data.x2, data.y2, data.brushColor, data.brushSize);
        });

        socket.on('ERASE_CANVAS', () => {
            context.clearRect(0, 0, width, height)
        });

        socket.on('RESIZED', (board)=>{
            for(let i = 0; i < board.length; i++){
                this.handleDrawLine(board[i].x1, board[i].y1, board[i].x2, board[i].y2, board[i].brushColor, board[i].brushSize);
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
        const { drawing, prevX, prevY, brushColor, brushSize, socket } = this.state;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.setState({ x, y });

        if (drawing) {
            console.log('Drawing', x, y);

            this.handleDrawLine(prevX, prevY, x, y, brushColor, brushSize);
            this.setState({ prevX: x, prevY: y });

            socket.emit('DRAW', {
                'x1': prevX,
				'y1': prevY,
				'x2': x,
                'y2': y,
                brushColor,
                brushSize,
            });
        };
    };

    handleEndDrawing = (e) => {
        console.log('Stopped Drawing');
        this.setState({ drawing: false });
    };

    handleDrawLine = (x1, y1, x2, y2, brushColor, brushSize) => {
        let newcontext = this.state.context;

        newcontext.strokeStyle = brushColor;
        newcontext.lineWidth = brushSize;

        this.setState({context:newcontext}, () => {
            const { context } = this.state;
            context.beginPath();        
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);    
            context.stroke();
            context.closePath();
        });
    };

    handleEraseBoard = () => {
        this.state.socket.emit('ERASE_CANVAS');
        this.state.context.clearRect(0, 0, this.state.width, this.state.height);
    };

    handleOnChangeBrushSize = (e) =>{
        const value = e.target.value;
        this.setState({ brushSize: value });
    };

    handleChangeColor = (brushColor) => {
        this.setState({ brushColor });
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
        const { users, brushSize } = this.state;

        return(
            <div className='room-page'>
                <div className='canvas-row'>
                    <PainterTools 
                        handleOnChangeBrushSize={this.handleOnChangeBrushSize} 
                        brushSize={brushSize} 
                        handleEraseBoard={this.handleEraseBoard}
                    />
                    <div className='canvas-container' ref={(node) => { this.canvasContain = node }}>
                        <canvas id='canvas' ref={(node) => { this.canvas = node }} 
                            onMouseDown={this.handleStartDrawing} onMouseUp={this.handleEndDrawing} 
                            onMouseMove={this.drawing} onMouseOut={this.handleEndDrawing}
                        />
                    </div>
                    <UsersList />
                </div>
            </div>
        )
    }
}

export default withRouter(Draw);