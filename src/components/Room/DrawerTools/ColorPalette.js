const colors = [
    '#FFFFFF',
	'#808080',
	'#000000',
    '#4F87CB',
    '#1CAD6C',
	'#65578F',
	'#FFB3C1',
    '#FCD200',
    '#FE754B',
    '#6E3B3B',
];

const ColorPalette = ({ handleChangeColor }) => {
	
	return (
		<div className='color-palette'>
			{colors.map((color) => (
				<div
					key={color}
					className='color'
					style={{ backgroundColor: color }}
					onClick={() => handleChangeColor(color)}
				></div>
			))}
		</div>
	)
};

export default ColorPalette;