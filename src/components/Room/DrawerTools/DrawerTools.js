import PencilSize from './PencilSize';
import ColorPalette from './ColorPalette';

import { ReactComponent as PencilIcon } from '../../../assets/icons/pencil-fill.svg';
import { ReactComponent as TrashBinIcon } from '../../../assets/icons//delete-bin-7-fill.svg';
import { ReactComponent as EraserIcon } from '../../../assets/icons/eraser-fill.svg';
import { ReactComponent as PaintBucketIcon } from '../../../assets/icons/paint-line.svg';

const buttons = [
    { name: 'Pencil', icon: PencilIcon },
    { name: 'Eraser', icon: EraserIcon },
    { name: 'Paint Bucket', icon: PaintBucketIcon },
];

const DrawerTools = ({ tool, handleChangeTool, handleOnChangePencilSize, handleChangeColor, pencilSize, handleClearCanvas, pencilColor }) => {

    return (
			<div className='drawer-tools-container'>
				<div className='buttons-container'>
                    {
                        buttons.map(({ name, icon: Icon }) => (
                            <button key={name} onClick={() => handleChangeTool(name)} className={tool === name ? 'selected' : ''}>
                                <Icon />
                            </button>
                        ))
                    }
                    <button onClick={handleClearCanvas} className={tool === 'Trash' ? 'selected' : ''}>
                        <TrashBinIcon />
                    </button>
				</div>
				<PencilSize
					pencilSize={pencilSize}
					handleOnChangePencilSize={handleOnChangePencilSize}
                    tool={tool}
				/>
				<ColorPalette handleChangeColor={handleChangeColor} pencilColor={pencilColor} />
			</div>
		);
}

export default DrawerTools;
