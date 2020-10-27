const UsersList = ({ users }) => {
    return (
        <div className='users-list-container'>
            <ul>
                {users.map((user) => <li key={user.id}>{user.username}</li> )}
            </ul>
        </div>
    )
}

export default UsersList;
