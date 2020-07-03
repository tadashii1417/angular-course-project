import {User} from "../user.model";
import {AuthActions, LOGIN, LOGIN_FAIL, LOGIN_START, LOGOUT} from "./auth.actions";

export interface State {
  user: User,
  loading: boolean,
  authError: string
}

const initialState: State = {
  user: null,
  loading: false,
  authError: null
}

export function authReducer(
  state = initialState,
  action: AuthActions) {

  switch (action.type) {
    case LOGIN:
      const {email, userId, token, expirationDate} = action.payload;
      const user = new User(email, userId, token, expirationDate);
      return {...state, user, authError: null, loading: false}

    case LOGOUT:
      return {...state, user: null}

    case LOGIN_START:
      return {...state, authError: null, loading: true}

    case LOGIN_FAIL:
      return {...state, authError: action.payload, user: null, loading: false}

    default:
      return state
  }
}
