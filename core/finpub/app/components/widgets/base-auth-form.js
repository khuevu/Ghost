import React, { Component } from 'react';
import { Redirect } from "react-router-dom";
import Session from '../../services/session';
import Loading from './loading';


class BaseAuthForm extends Component {
    
    constructor(props) {
        super(props);
        let state = {
            fetched: Session.user !== null,
            redirectToReferrer: false,
            username: '', 
            password: '', 
            fullname: '',
            error: null 
        };
        if (state.fetched) {
            state.redirectToReferrer = true;
        }
        this.state = state;

    }

    componentDidMount() {
        if (!this.state.fetched) {
            Session.fetchUserInfo()
                .then(userInfo => {
                    // if already login, redirect
                    if (userInfo) {
                        this.redirect();
                    }
                    else {
                        // show login
                        this.setState({fetched: true});
                    }
                    
                })
                .catch(e => {
                    this.setState({fetched: true});
                })
        }
    }

    redirect() {
        // if it is a request from another app
        // kick back
        let queryParam = window.location.search;
        if (queryParam) {
            queryParam = new URLSearchParams(queryParam);
            if (queryParam.has('next')) {
                window.location.href = queryParam.get('next');
                return;
            }
        }

        // else, enter reader app
        this.setState({redirectToReferrer: true});
    }

    fullnameChanged = (e) => {
        this.setState({fullname: e.target.value});
    }

    usernameChanged = (e) => {
        this.setState({username: e.target.value});
    }

    passwordChanged = (e) => {
        this.setState({password: e.target.value});
    }

    signin = (e) => {
        e.stopPropagation();
        e.preventDefault();

        Session.authenticate(this.state.username, this.state.password)
            .then(resp => {
                if (resp.status === 201) {
                    // session created
                    // fetch user Info
                    Session.fetchUserInfo().then(info => {
                        if (info) {
                            // redirect;
                            this.redirect();
                        }
                        else {
                            this.setState({error: 'Could not get user info'});
                        }
                    })
                }
            })
            .catch(e => {
                this.setState({error: e.statusText});
            })
    }

    signup = (e) => {

    }

    renderSignin() {
        return <form id='login' className='gh-signin'>
            <div className='form-group success ember-view'>
                <span className='gh-input-icon gh-icon-mail'>
                    <input autoFocus="" 
                        name="identification" 
                        autoComplete="username" tabIndex="1" 
                        placeholder="Email Address" 
                        value={this.state.username}
                        onChange={this.usernameChanged}
                        autoCorrect="off" autoCapitalize="off" 
                        className="email ember-text-field gh-input ember-view" 
                        type="email"/>
                </span>
            </div>
            <div className='form-group'>
                <span className='gh-input-icon gh-icon-lock forgotten-wrap'>
                <input name="password" autoComplete="current-password" 
                    tabIndex="2" placeholder="Password" 
                    autoCorrect="off"
                    value={this.state.password}
                    onChange={this.passwordChanged}
                    className="password ember-text-field gh-input ember-view" 
                    type="password"/>
                    <button tabIndex="4" id="ember11" className="forgotten-link gh-btn gh-btn-link gh-btn-icon ember-view" type="button">
                        <span>Forgot?</span>
                    </button>
                </span>
            </div>
            <button tabIndex="3" className="login gh-btn gh-btn-blue gh-btn-block gh-btn-icon ember-view" 
                onClick={this.signin}
                type="submit">
                <span>Sign In</span>
            </button>
        </form>;
    }

    renderSignup() {
        return [<form key={'form'} id='signup' className='gh-flow-create'>
            <div className='form-group success ember-view'>
                <label htmlFor='name'>Full name</label>
                <span className='gh-input-icon gh-icon-user'>
                    <input autoFocus=""  
                        name="name" 
                        autoComplete="name" tabIndex="1" 
                        placeholder="Eg. John H. Watson" 
                        value={this.state.fullname}
                        onChange={this.fullnameChanged}
                        autoCorrect="off" autoCapitalize="off" 
                        className=" ember-text-field gh-input ember-view" 
                        type="text"/>
                </span>
            </div>
            <div className='form-group success ember-view'>
                <label htmlFor='identification'>Email</label>
                <span className='gh-input-icon gh-icon-mail'>
                    <input autoFocus="" 
                        name="identification" 
                        autoComplete="username" 
                        tabIndex="2" 
                        placeholder="Email Address" 
                        value={this.state.username}
                        onChange={this.usernameChanged}
                        autoCorrect="off" autoCapitalize="off" 
                        className="email ember-text-field gh-input ember-view" 
                        type="email"/>
                </span>
            </div>
            <div className='form-group'>
                <label htmlFor='password'>Password</label>
                <span className='gh-input-icon gh-icon-lock'>

                    <input name="password" autoComplete="current-password" 
                        tabIndex="3" placeholder="Password" 
                        autoCorrect="off"
                        value={this.state.password}
                        onChange={this.passwordChanged}
                        className="password ember-text-field gh-input ember-view" 
                        type="password"/>
                    </span>
            </div>            
        </form>,
        <button key={'button'} tabIndex="4" className=" gh-btn gh-btn-green gh-btn-block gh-btn-icon ember-view" 
                onClick={this.signup}
                type="submit">
                <span>Create Account</span>
        </button>]
    }

    render() {

        let { signup } = this.props;

        if (this.state.redirectToReferrer) {
            let { from } = this.props.location.state || { from: { pathname: "/" } };
            return <Redirect to={from} />;
        }
        
        if (!this.state.fetched) {
            return <Loading />;
        }        


        let error = null;
        if (this.state.error) {
            error = <p className='main-error'>{this.state.error}</p>
        }

        let form = signup? this.renderSignup(): this.renderSignin();
        let header = signup? <header>
            <h1>Create Your Account</h1>
        </header>: null;

        return <main className='gh-main' role='main'>
            <div className='gh-flow'>
                <div className='gh-flow-content-wrap'>
                    <section className='gh-flow-content'>
                        {header}
                        {form}
                        {error}                        
                    </section>
                </div>
            </div>
        </main>;
    }
}

export default BaseAuthForm;