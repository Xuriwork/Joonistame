const PencilSize = ({ tool, pencilSize, handleOnChangePencilSize }) => {
    return (
			<div>
				<input
					className='pencil-size-input'
					type='range'
					min={2}
					max={5}
					value={pencilSize}
					onChange={handleOnChangePencilSize}
					disabled={tool !== 'Pencil'}
				/>
			</div>
		);
};

export default PencilSize;