const UsersList = ({ users }) => {
    return (
        <div>
            <h3>Users</h3>
            <div>
                {users.map((user) => <div key={user.id}>{user.name}</div> )}
            </div>
        </div>
    )
}

export default UsersList;
