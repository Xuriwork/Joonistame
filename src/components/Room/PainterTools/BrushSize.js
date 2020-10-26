import React from 'react'

const BrushSize = ({ brushSize, handleOnChangeBrushSize }) => {
    return (
        <div>
            <h3>Brush Size</h3>
            <div className='size-value'>{brushSize}</div>
            <input className='brush-size' type='range' min={1} max={5} value={brushSize} onChange={handleOnChangeBrushSize} />
        </div>
    )
}

export default BrushSize;
