import { jsonDeepParse } from '@/lib/supabaseClient';
import { decrypt } from './decrypt';
import { encrypt } from './encrypt';
import { getKey } from './sessionService';

export const fetchWrapper = {
    get,
    post,
    put,
    delete: _delete
};

export const SERVER_URL = 'https://www.cvmine.com/api_in/';

const base_url = SERVER_URL;

const aKey = 'T@MiCr097124!iCR';


async function get(url, no_base_url) {
    const requestOptions = {
        method: 'GET'
    };
    const response = await fetch((!no_base_url ? base_url : '') + url, requestOptions);
    return handleResponse(response);
}

async function post(url, body, skipEncryption) {
    console.log(body);

    const headers = prepareHeaders();

    // Remove 'Content-Type' header if the body is FormData
    if (body instanceof FormData) {
        delete headers['Content-Type']; // Let the browser set the correct boundary for multipart/form-data
    }

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: !skipEncryption && !(body instanceof FormData) ? JSON.stringify(encrypt(body, getKey())) : body
    };

    console.log(requestOptions);
    const response = await fetch(base_url + url, requestOptions);
    return handleResponse(response);
}

async function put(url, body) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
    const response = await fetch(url, requestOptions);
    return handleResponse(response);
}


// prefixed with underscored because delete is a reserved word in javascript
async function _delete(url) {
    const requestOptions = {
        method: 'DELETE'
    };
    const response = await fetch(url, requestOptions);
    return handleResponse(response);
}

// helper functions

export function handleResponse(response) {
    return response.text().then(text => {
        var data = text && JSON.parse(text);
        if (data.data) {
            data.data = decrypt(data.data)
        }
        // if (data) {
        //     data = jsonDeepParse(data)
        // }
        console.log(data)
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}

function prepareHeaders(aKey) {
    if (typeof window != 'undefined') {
        let user
        let headers = { 'Content-Type': 'application/json' }
        let region = 'IN';
        let timestamp = Date.now()
        let ip = '1.1.1.1'
        headers['ip'] = ip;
        headers['timestamp'] = timestamp;
        headers['region'] = region;

        try {
            user = JSON.parse(localStorage.getItem('user'))
            headers['token'] = user.token;
            headers['hash'] = generateHash(timestamp, ip, region, user.token);
        }
        catch (err) {
            console.log(err)
            user = localStorage.getItem('user')
            if (user) {
                JSON.parse(user)
            }

            if (user.token) {
                headers['hash'] = generateHash(timestamp, ip, region, user.token);
            }
            else {
                headers['hash'] = generateHash(timestamp, ip, region, aKey);
            }

        }

        return headers;

    }

}

function generateHash(timestamp, ip, region, key) {
    const crypto = require('crypto-js');
    console.log(key)
    console.log(timestamp + ip + region + key)
    return crypto.SHA512(timestamp + ip + region + key).toString();
}   