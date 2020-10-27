const Canvas = ({ handleUseBucket, handleStartDrawing, handleEndDrawing, handleDrawing, canvas, canvasContainer, tool }) => {
    return (
        <div className='canvas-container' ref={canvasContainer}>
            <canvas 
                ref={canvas} 
                onClick={tool === 'Paint Bucket' ? handleUseBucket : undefined}
                onMouseDown={handleStartDrawing} onMouseUp={handleEndDrawing} 
                onMouseMove={handleDrawing} onMouseOut={handleEndDrawing} 
                className={tool}
            />
        </div>
    );
};

export default Canvas;
