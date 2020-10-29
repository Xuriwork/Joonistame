export const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
};	

export const validateJoinRoomData = (username, roomID) => {
    const errors = {};
        
    const trimmedUsername = username.replace(' ', '');
    const trimmedRoomID = roomID.replace(' ', '');

    if (isEmpty(username)) {
        errors.username = 'This field is required';
    } else if (!/^[a-zA-Z0-9_-]*$/.test(trimmedUsername)) {
        errors.username = 'Only alphanumeric characters';
    } else if (trimmedUsername.length < 1) {
        errors.username = 'The min character length is 1 characters';
    } else if (trimmedUsername.length > 50) {
        errors.username = 'The max character length is 50 characters';
    };

    if (isEmpty(roomID)) {
        errors.roomID = 'This field is required';
    } else if (!/^[a-zA-Z0-9_-]*$/.test(trimmedRoomID)) {
        errors.roomID = 'Only alphanumeric characters';
    } else if (trimmedRoomID.length < 1) {
        errors.roomID = 'The min character length is 1 characters';
    } else if (trimmedRoomID.length > 150) {
        errors.roomID = 'The max character length is 150 characters';
    };

    const valid = Object.keys(errors).length === 0 ? true : false;

    return { errors, valid };
};