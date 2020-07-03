import {Action} from "@ngrx/store";

export const AUTHENTICATE_SUCCESS = '[Auth] LOGIN / SIGNUP SUCCESS';
export const LOGOUT = '[Auth] LOGOUT';
export const LOGIN_START = '[Auth] LOGIN_START';
export const AUTHENTICATE_FAIL = '[Auth] LOGIN /  SIGNUP FAIL';
export const SIGNUP_START = '[Auth] SIGNUP_START';
export const AUTO_LOGIN = '[Auth] auto login';

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;

  constructor(public payload: { email: string, userId: string, token: string, expirationDate: Date }) {
  }
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;

  constructor(public payload: { email: string, password: string }) {
  }
}

export class AuthenticateFail implements Action {
  readonly type = AUTHENTICATE_FAIL;

  constructor(public payload: string) {
  }
}

export class SignupStart {
  readonly type = SIGNUP_START;

  constructor(public payload: { email: string, password: string }) {
  }
}

export class AutoLogin {
  readonly type = AUTO_LOGIN;
}

export type AuthActions =
  AuthenticateSuccess
  | Logout
  | LoginStart
  | AuthenticateFail
  | AutoLogin
  | SignupStart;
