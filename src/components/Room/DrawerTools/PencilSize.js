const PencilSize = ({ pencilSize, handleOnChangePencilSize }) => {
    return (
        <div>
            <h3>Pencil Size</h3>
            <div className='size-value'>{pencilSize}</div>
            <input className='pencil-size-input' type='range' min={1} max={5} value={pencilSize} onChange={handleOnChangePencilSize} />
        </div>
    );
};

export default PencilSize;