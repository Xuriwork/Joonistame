import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import io from 'socket.io-client';

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
            color: 'black', 
            size: 1,
            x: null, 
            y: null, 
            prevX: null, 
            prevY: null
        }
    }

    componentWillMount() {
		const { authorized, history } = this.props;
		if (!authorized) return history.push('/join');
    };
    
    componentDidMount() {
        if (!this.props.authorized) return;
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
                this.drawLine(canvas[i].x1, canvas[i].y1, canvas[i].x2, canvas[i].y2, canvas[i].color, canvas[i].size);
            };
        });

        socket.on('DRAW', (data) => {
            this.drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
        });

        socket.on('ERASE_CANVAS', () => {
            this.state.context.clearRect(0, 0, this.state.width, this.state.height)
        });

        socket.on('user left', (data) =>{
            console.log('User left', data);
            this.setState({users:data});
        })

        socket.on('RESIZED', (board)=>{
            for(let i = 0; i < board.length; i++){
                this.drawLine(board[i].x1, board[i].y1, board[i].x2, board[i].y2, board[i].color, board[i].size);
            }
        });

        socket.on('MESSAGE', (data) => this.setMessages(data));
        
        window.addEventListener('resize', ()=>{
            console.log('Resizing');
        }, false)        
    }

    selectColor = (color) => {
        console.log('Changing color to', color);
        this.setState({ color });
    };
    
    startDraw = (e) => {
        console.log('Started Drawing');
        this.setState({ drawing:true, prevX: this.state.x, prevY: this.state.y });
    };

    drawing = (e) => {
        let rect = this.canvas.getBoundingClientRect();
        let x=e.clientX - rect.left;
        let y=e.clientY - rect.top;
        this.setState({ x, y});
        if(this.state.drawing){
            console.log('Drawing', x, y);
            this.drawLine(this.state.prevX, this.state.prevY, x, y, this.state.color, this.state.size);
            this.setState({prevX:x, prevY:y});
            this.state.socket.emit('DRAW', {
                'x1': this.state.prevX,
				'y1': this.state.prevY,
				'x2': x,
                'y2': y,
                color: this.state.color,
                size:this.state.size
            });
            
        }
    }

    endDraw = (e) => {
        console.log('Stopped Drawing');
        this.setState({drawing:false});
    }

    drawLine = (x1, y1, x2, y2, color, size) => {
        let newcontext = this.state.context;

        newcontext.strokeStyle = color;
        newcontext.lineWidth = size;

        this.setState({context:newcontext}, () => {
            this.state.context.beginPath();        
            this.state.context.moveTo(x1, y1);
            this.state.context.lineTo(x2, y2);    
            this.state.context.stroke();
            this.state.context.closePath();
        });
    };

    eraseBoard = () => {
        this.state.socket.emit('ERASE_CANVAS');
        this.state.context.clearRect(0, 0, this.state.width, this.state.height);
        // this.setState({context:this.state.context.clearRect(0, 0, this.state.width, this.state.height) });
    };

    _handleInputChange = (e) =>{
        const value = e.target.value;
        const name = e.target.name;
        this.setState({[name]: value});
    }

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
        return(
            <div className={'draw-container'}>
                <div className={'main-title'}>Junction Draw</div>
                {/* {this.state.name} */}
                <div className={'canvas-row'}>
                    <div className={'tool-box'}>
                        <button onClick={this.eraseBoard} >Clean Board</button>
                        <div className={'color-contain'}>
                            <h3>Colors</h3>
                            <button className={'color-button'} style={{backgroundColor:'red'}} onClick={()=>this.selectColor('red')} />
                            <button className={'color-button'} style={{backgroundColor:'green'}} onClick={()=>this.selectColor('green')} />
                            <button className={'color-button'} style={{backgroundColor:'blue'}} onClick={()=>this.selectColor('blue')} />
                            <button className={'color-button'} style={{backgroundColor:'yellow'}} onClick={()=>this.selectColor('yellow')} />
                            <button className={'color-button'} style={{backgroundColor:'orange'}} onClick={()=>this.selectColor('orange')} />
                            <button className={'color-button'} style={{backgroundColor:'purple'}} onClick={()=>this.selectColor('purple')} />
                        </div>
                        <div className={'size-contain'}>
                            <h3>Brush Size</h3>
                            <div className={'size-value'}>{this.state.size}</div>
                            <input className={'brush-size'} name={'size'} type='range' min={1} max={5} value={this.state.size} onChange={this._handleInputChange} />
                        </div>
                    </div>
                    <div className={'canvas-contain'} ref={(node)=>{this.canvasContain = node}}>
                        <canvas id={'canvas'} ref={(node)=>{this.canvas = node}} 
                            onMouseDown={this.startDraw} onMouseUp={this.endDraw} 
                            onMouseMove={this.drawing} onMouseOut={this.endDraw}
                        />
                    </div>
                    <div>
                        <h3>Users</h3>
                        <div>
                            {this.state.users.map(user=>{
                                return <div key={user.id}>{user.name}</div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Draw);