const UsersList = ({ users }) => {
    return (
			<div className='users-list-container'>
				<ul>
					{users.map((user) => (
						<li key={user.id}>
							<img src={user.userCharacter} alt='Character Icon' />
							{user.username}
						</li>
					))}
				</ul>
			</div>
		);
}

export default UsersList;
