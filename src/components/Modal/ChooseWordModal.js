import { useEffect } from "react";
import { generateRandomNoun } from "../../utils/chooseRandomWord";

const ChooseWordModal = ({ handleChooseWord }) => {
    const [words, setWords] = [];

    useEffect(() => setWords(generateRandomNoun()), [setWords]);
    
    return (
        <div className='modal'>
            <div>
                {
                    words.map((word) => (
                        <button onClick={handleChooseWord}>{word}</button>
                    ))
                }
            </div>
        </div>
    );
};

export default ChooseWordModal;