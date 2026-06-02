let _email = null;
let _password = null;

export function setAdminCredentials(email, password) {
    _email = email;
    _password = password;
}

export function getAdminCredentials() {
    if (_email && _password) {
        return { email: _email, password: _password };
    }
    return null;
}

export function clearAdminCredentials() {
    _email = null;
    _password = null;
}
