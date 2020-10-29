const UsersList = ({ users }) => {
    return (
        <div className='users-list-container'>
            <ul>
                {users.map((user) => <li key={user.id}>
                    <img src={user.imageURL} alt='' />
                    {user.username}
                </li> )}
            </ul>
        </div>
    )
}

export default UsersList;
