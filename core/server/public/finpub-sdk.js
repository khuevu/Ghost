(function() {
    'use strict'

    var authFrame,
        authUrl;

    function loadFrame(src, container) {
        container = container? container: document.body;
        return new Promise(function (resolve) {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = src;
            iframe.onload = function () {
                resolve(iframe);
            };
            iframe.style.display = 'none';
            iframe.src = src;
            iframe.style.position = 'fixed';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.background = 'transparent';
            iframe.style.top = '0';
            iframe.style['z-index'] = '9999';
            container.appendChild(iframe);
        });
    }

    function init(siteUrl) {
        authUrl = siteUrl + '/reader';
        authFrame = loadFrame(authUrl);
        return authFrame;
    }

    function show(path, callback) {
        return authFrame.then(function(frame){
            frame.src = authUrl + '/' + path;
            frame.style.display = 'block';
            window.addEventListener('message', function frameEventListener(event) {
                if (event.source !== frame.contentWindow) {
                    return;
                }
                if (!event.data) {
                    return;
                }
                window.removeEventListener('message', frameEventListener);
                frame.style.display = 'none';
                if (callback) {
                    if (event.data.msg === 'login-success') {
                        callback(event.data.user);
                    }
                    else if (event.data.msg === 'close-auth-popup') {
                        callback(false);
                    }
                }
            })
        });
    }


    function signin(callback) {
        show('login', callback);
    }

    function register(callback) {
        show('register', callback);
    }

    function signout() {
        var sessionApi = '/ghost/api/canary/admin/session';
        var config = {
            method: 'delete',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            credentials: 'include'
        };
        return fetch(sessionApi, config)
                .then(status)
                .then(content);
    }

    function status(response) {
        if (response.status !== undefined) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(response)
            }
        }
        else {
            return response;
        }
    }

    function content(response) {
        return response.json === undefined? response: response.json();
    }

    function getLoginInfo() {
        var authApi = '/ghost/api/v2/admin/users/me?include=roles';
        var config = {
            method: 'get',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            credentials: 'include'
        };
        return fetch(authApi, config)
            .then(status)
            .then(content)
            .then(function(resp) {
                var users = resp.users? resp.users: resp;
                return users[0]
            });
    }

    function getPaymentUrl(amount) {
        var payload = {amount: amount}
        var paymentApi = 'ghost/api/canary/finpub/payments/';
        var config = {
            method: 'post',
            body: JSON.stringify(payload),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            credentials: 'include'
        };

        return fetch(paymentApi, config)
                .then(status)
                .then(content)
                .then(function(res) {
                    console.log('res===>', res);
                })
    }


    if (typeof window !== 'undefined') {
        window.finpub = window.finpub || {
            init: init,
            signin: signin,
            signout: signout,
            register: register,
            getLoginInfo: getLoginInfo,
            getPaymentUrl: getPaymentUrl
        };

        if (window.onFinpubReady) {
            window.onFinpubReady(window.finpub);
        }
    }

})();