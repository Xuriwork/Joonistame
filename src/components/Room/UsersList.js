const UsersList = ({ users }) => {
    return (
			<div className='users-list-container'>
				<ul>
					{users.map((user) => (
						<li key={user.id} className={user.isCorrectGuess ? 'isCorrectGuess' : ''}>
							<img src={user.userCharacter} alt='Character Icon' />
							{user.username}

							<span>{user.points}</span>
						</li>
					))}
				</ul>
			</div>
		);
}

export default UsersList;
