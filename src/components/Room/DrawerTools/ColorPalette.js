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
	
	const onChange = (e) => {
		console.log(e);
	};
	
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
			<label htmlFor='colorPicker' aria-label='colorPicker' style={{ display: 'none' }}></label>
			<input type='color' id='colorPicker' name='head' value='#e66465' onChange={onChange} />
		</div>
	)
};

export default ColorPalette;