const Canvas = ({ handleStartDrawing, handleEndDrawing, handleDrawing, canvas, canvasContainer, tool }) => {

    
    return (
        <div className='canvas-container' ref={canvasContainer}>
            <canvas 
                ref={canvas} 
                onMouseDown={handleStartDrawing} onMouseUp={handleEndDrawing} 
                onMouseMove={handleDrawing} onMouseOut={handleEndDrawing} 
                className={tool}
            />
        </div>
    )
}

export default Canvas;
