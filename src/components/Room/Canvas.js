const Canvas = ({ handleStartDrawing, handleEndDrawing, handleDrawing, canvas, canvasContainer }) => {
    
    return (
        <div className='canvas-container' ref={canvasContainer}>
            <canvas ref={canvas} 
                onMouseDown={handleStartDrawing} onMouseUp={handleEndDrawing} 
                onMouseMove={handleDrawing} onMouseOut={handleEndDrawing}
            />
        </div>
    )
}

export default Canvas;
