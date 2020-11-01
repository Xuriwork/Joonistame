const Canvas = ({ handleUseBucket, handleStartDrawing, handleEndDrawing, handleDrawing, context, canvas, canvasContainer, tool, socketID, drawer }) => {
    
    let className = tool.replace(' ', '_').toLowerCase();
    if (tool === 'Paint Bucket' && context.fillStyle === '#000000') {
        className = 'paint_bucket_white';
    };

    return (
        <div className='canvas-container' style={{ pointerEvents: socketID !== drawer && 'none' }} ref={canvasContainer}>
            <canvas 
                ref={canvas} 
                onClick={tool === 'Paint Bucket' ? handleUseBucket : undefined}
                onMouseDown={handleStartDrawing} onMouseUp={handleEndDrawing} 
                onMouseMove={handleDrawing} onMouseOut={handleEndDrawing} 
                className={className}
            />
        </div>
    );
};

export default Canvas;
