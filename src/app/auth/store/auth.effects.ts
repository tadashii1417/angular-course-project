import {Actions, ofType, Effect} from "@ngrx/effects";
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {User} from "../user.model";
import {AuthService} from "../auth.service";


export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}

const handleAuthentication = resData => {
  const expirationDate = new Date(new Date().getTime() + 1000 * +resData.expiresIn);
  const user = new User(
    resData.email,
    resData.localId,
    resData.idToken,
    expirationDate
  );
  localStorage.setItem('userData', JSON.stringify(user));

  // Note: Not using of() here because map automatically wrap return in
  // an observable
  return new AuthActions.AuthenticateSuccess(
    {
      email: resData.email,
      userId: resData.localId,
      token: resData.idToken,
      expirationDate: expirationDate
    });
}

const handleError = (errorResponse: HttpErrorResponse) => {
  let errorMessage: string;

  switch (errorResponse.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = "This email exists already";
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = "This email not exists";
      break;
    case 'INVALID_PASSWORD':
      errorMessage = "Password is not correct";
      break;
    case 'USER_DISABLED':
      errorMessage = "This is user is disabled";
      break;
    default:
      errorMessage = "I don't know."
  }

  // create new observable without error to prevent the action chain died.
  return of(new AuthActions.AuthenticateFail(errorMessage));
}

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions,
              private router: Router,
              private authService: AuthService,
              private http: HttpClient) {
  }

  apiKey = 'AIzaSyCAOyDlccMc-zYoAcp8zBBG_Thb3O1Jd-Y';

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),

    // TODO: understand switchMap
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http
        .post<AuthResponseData>(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true
          })
        .pipe(
          tap((resData)=> {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
          map(handleAuthentication),
          catchError(handleError)
        )
    })
  )

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http
        .post<AuthResponseData>(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`,
          {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true
          })
        .pipe(
          tap((resData)=> {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
          map(handleAuthentication),
          catchError(handleError)
        )
    }),
  );


  // Let ngrx effect know that this function will not return any observable
  // If not: it gonna be throw an error.
  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/'])
    })
  )

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem('userData');
      this.router.navigate((['/auth']));
    })
  )

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        return {type: "DUMMY"}
      }
      const {email, id, _token, _tokenExpirationDate} = userData;
      const loadedUser = new User(email, id, _token, new Date(_tokenExpirationDate));

      if (loadedUser.token) {
        const expirationDuration = new Date(_tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);

        return new AuthActions.AuthenticateSuccess({
          email: email,
          userId: id,
          token: _token,
          expirationDate: new Date(_tokenExpirationDate)
        });

        // this.autoLogout(expirationDuration);
      }

      // This function must return action or use {dispatch: false}
      return {type: "DUMMY"}
    })
  )
}


// TODO: tap not return anything, map return an observerable















