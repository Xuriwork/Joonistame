import { useEffect, useState } from 'react';
import { generateRandomNoun } from '../../utils/chooseRandomWord';

const ChooseWordModal = ({ handleChooseWord }) => {
    const [words, setWords] = useState([]);

    useEffect(() => setWords(generateRandomNoun()), [setWords]);
    
    return (
        <div className='modal-overlay'>
            <div className='modal'>
                {
                    words.map((word) => (
                        <button key={word} onClick={() => handleChooseWord(word)}>{word}</button>
                    ))
                }
            </div>
        </div>
    );
};

export default ChooseWordModal;