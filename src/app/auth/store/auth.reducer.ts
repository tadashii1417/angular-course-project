import {User} from "../user.model";
import {AuthActions, LOGIN, LOGOUT} from "./auth.actions";
import {retry} from "rxjs/operators";

export interface State {
  user: User
}

const initialState: State = {
  user: null
}

export function authReducer(
  state = initialState,
  action: AuthActions) {

  switch (action.type) {
    case LOGIN:
      const {email, userId, token, expirationDate} = action.payload;
      const user = new User(email, userId, token, expirationDate);
      return {...state, user}

    case LOGOUT:
      return {...state, user: null}

    default:
      return state
  }
}
