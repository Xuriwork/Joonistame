import nounsList from './nouns.json';

const getRandomInt = (characterLength) => {
	return Math.floor(Math.random() * characterLength);
};

export const generateRandomNoun = () => {
    const listOfNouns = [];
    const noun = () => `${nounsList.nouns[getRandomInt(nounsList.nouns.length)]}`;

    for (let i = 0; i < 3; i++) {
        const nounToAdd = noun();
        if (!listOfNouns.includes(nounToAdd)) {
            listOfNouns.push(nounToAdd);
        };
    };

    return listOfNouns;
};