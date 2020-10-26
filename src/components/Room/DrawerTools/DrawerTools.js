import PencilSize from './PencilSize';
import ColorPalette from './ColorPalette';

import { ReactComponent as PencilIcon } from '../../../assets/icons/pencil-fill.svg';
import { ReactComponent as TrashBinIcon } from '../../../assets/icons//delete-bin-7-fill.svg';
import { ReactComponent as EraserIcon } from '../../../assets/icons/eraser-fill.svg';
import { ReactComponent as PaintBucketIcon } from '../../../assets/icons/paint-line.svg';
import { useState } from 'react';

const buttons = [
    { name: 'Pencil', icon: PencilIcon },
    { name: 'Trash', icon: TrashBinIcon },
    { name: 'Paint Bucket', icon: PaintBucketIcon },
];

const DrawerTools = ({ handleOnChangePencilSize, pencilSize, handleEraseCanvas }) => {
    const [toolView, setToolView] = useState('Pencil');

    const handleChangeToolView = (tool) => setToolView(tool);

    return (
			<div className='drawer-tools-container'>
				<div className='buttons-container'>
                    {
                        buttons.map(({ name, icon: Icon }) => (
                            <button key={name} onClick={() => handleChangeToolView(name)}>
                                <Icon />
                            </button>
                        ))
                    }
                    <button onClick={handleEraseCanvas}>
                        <EraserIcon />
                    </button>
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
