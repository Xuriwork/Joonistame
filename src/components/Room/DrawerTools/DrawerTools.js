import BrushSize from './BrushSize';
import ColorPalette from './ColorPalette';

const DrawerTools = ({ handleOnChangeBrushSize, brushSize , handleEraseBoard}) => {
    return (
        <div className='drawer-tools-container'>
            <button onClick={handleEraseBoard}>Pencil</button>
            <button onClick={handleEraseBoard}>Erase Canvas</button>
            <button onClick={handleEraseBoard}>Erase Canvas</button>
            <button onClick={handleEraseBoard}>Erase Canvas</button>
            <BrushSize brushSize={brushSize} handleOnChangeBrushSize={handleOnChangeBrushSize} />
            <ColorPalette />
        </div>
    )
}

export default DrawerTools;
