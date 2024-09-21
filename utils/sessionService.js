import { aKey } from "./encrypt";

export function checkSession() {
    if (typeof window != 'undefined') {
        let user = localStorage.getItem('user');
        if (user) {
            try {
                user = JSON.parse(user)
                if (user.token) {
                    return true;
                }
                else {
                    return false
                }
            }
            catch (err) {
                console.log(err)
                return false
            }
        }
    }
    else {
        return false
    }
}

export function getKey() {
    if (typeof window != 'undefined') {
        let user = localStorage.getItem('user');
        if (user) {
            try {
                user = JSON.parse(user)
                if (user.secretkey) {
                    return user.secretkey;
                }
                else {
                    return aKey
                }
            }
            catch (err) {
                console.log(err)
                return aKey
            }
        }
    }
    else {
        return aKey
    }
}


export function getSession() {
    if (typeof window != 'undefined') {
        let user = localStorage.getItem('user');
        if (user) {
            try {
                user = JSON.parse(user)
                if (user.token) {
                    return user;
                }
                else {
                    return null
                }
            }
            catch (err) {
                console.log(err)
                return null
            }
        }
    }
    else {
        return null
    }
}