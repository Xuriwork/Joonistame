import BrushSize from './BrushSize';
import ColorPalette from './ColorPalette';

const PainterTools = ({ handleOnChangeBrushSize, brushSize , handleEraseBoard}) => {
    return (
        <div className='painter-tools'>
            <button onClick={handleEraseBoard}>Erase Canvas</button>
            <ColorPalette />
            <BrushSize brushSize={brushSize} handleOnChangeBrushSize={handleOnChangeBrushSize} />
        </div>
    )
}

export default PainterTools;
