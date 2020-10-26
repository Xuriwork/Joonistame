const Canvas = ({ handleStartDrawing, handleEndDrawing, drawing, canvas, canvasContainer }) => {

    return (
        <div className='canvas-container' ref={canvasContainer}>
            <canvas ref={canvas} 
                onMouseDown={handleStartDrawing} onMouseUp={handleEndDrawing} 
                onMouseMove={drawing} onMouseOut={handleEndDrawing}
            />
        </div>
    )
}

export default Canvas;
