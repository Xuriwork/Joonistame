import PencilSize from './PencilSize';
import ColorPalette from './ColorPalette';

import { ReactComponent as PencilIcon } from '../../../assets/icons/pencil-fill.svg';
import { ReactComponent as TrashBinIcon } from '../../../assets/icons//delete-bin-7-fill.svg';
import { ReactComponent as EraserIcon } from '../../../assets/icons/eraser-fill.svg';
import { ReactComponent as PaintBucketIcon } from '../../../assets/icons/paint-line.svg';
import { useState } from 'react';

const buttons = [
    { name: 'Pencil', icon: PencilIcon },
    { name: 'Eraser', icon: EraserIcon },
    { name: 'Paint Bucket', icon: PaintBucketIcon },
    { name: 'Trash', icon: TrashBinIcon },
];

const DrawerTools = ({ handleOnChangePencilSize, pencilSize, handleEraseCanvas }) => {
    const [tool, setTool] = useState('Pencil');

    const handleChangeTool = (tool) => setTool(tool);

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
				</div>
				<PencilSize
					pencilSize={pencilSize}
					handleOnChangePencilSize={handleOnChangePencilSize}
				/>
				<ColorPalette />
			</div>
		);
}

export default DrawerTools;
