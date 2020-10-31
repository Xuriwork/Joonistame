import React, { useCallback, useMemo } from 'react';
import qs from 'query-string';
import startCase from 'lodash/startCase';
import RotateIcon from '../../assets/icons/rotate-icon.svg';

import {
	Avatar,
	bodyMap,
	hairMap,
	clothingMap,
	eyesMap,
	eyebrowsMap,
	mouthsMap,
	facialHairMap,
	accessoryMap,
	hatMap,
	graphicsMap,
	theme,
} from '@bigheads/core';
import { getRandomOptions } from './getRandomOptions';
import { useHistory, useLocation } from 'react-router-dom';

const settingMaps = {
	faceMask: { true: 'true', false: 'false' },
	faceMaskColor: theme.colors.clothing,
	body: bodyMap,
	lipColor: theme.colors.lipColors,
	skinTone: theme.colors.skin,
	hair: hairMap,
	hairColor: theme.colors.hair,
	clothing: clothingMap,
	clothingColor: theme.colors.clothing,
	graphic: graphicsMap,
	eyes: eyesMap,
	eyebrows: eyebrowsMap,
	mouth: mouthsMap,
	facialHair: facialHairMap,
	accessory: accessoryMap,
	hat: hatMap,
	hatColor: theme.colors.clothing,
	lashes: { true: 'true', false: 'false' },
};

const CharacterEditor = ({ setUserCharacter }) => {
	const history = useHistory();
	const location = useLocation();
	
	const props = useMemo(() => (location.search ? qs.parse(location.search) : getRandomOptions()),
		[location.search]
	);

	const updateProp = useCallback(
		(e) => {
			const name = e.target.name;
			const value = e.target.value;

			history.push(
				`/character-editor?${qs.stringify({
					...props,
					[name]: value,
				})}`
			);
		},
		[props, history]
	);

	const handleGenerateRandomCharacter = useCallback(() => {
		history.push(
			`/character-editor?${qs.stringify(getRandomOptions())}`
		);
	}, [history]);

	const svgUrl = useMemo(
		() =>
			`/svg?${qs.stringify(
				Object.entries(props).reduce(
					(total, [key, value]) => ({ ...total, [key]: value }),
					{}
				)
			)}`,
		[props]
	);

	const handleSaveCharacter = () => {
		setUserCharacter(`https://bigheads.io${svgUrl}`);
		history.push('/join');
	};

	return (
		<div className='character-editor-component'>
			<div className='character-container'>
				<Avatar
					{...props}
				/>
			</div>
			<div className='settings-container'>
					<div className='title-container'>
						<h2>Settings</h2>
						<button
							className='randomize-button'
							onClick={handleGenerateRandomCharacter}
						>
							<img src={RotateIcon} alt='random' />
						</button>
					</div>
				<div className='settings-list'>
					{Object.entries(settingMaps).map(([key, map]) => (
						<div key={key}>
							<label htmlFor='body'>{startCase(key)}</label>
							<select
								id={key}
								name={key}
								defaultValue={props[key]}
								onChange={updateProp}
								className='character-select'
							>
								{Object.keys(map).map((value) => (
									<option key={value} value={value}>
										{startCase(value)}
									</option>
								))}
							</select>
						</div>
					))}
				</div>
				<button className='save-character-button' onClick={handleSaveCharacter}>
					Save character
				</button>
			</div>
		</div>
	);
};

export default CharacterEditor;
