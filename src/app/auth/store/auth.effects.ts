import {Actions, ofType, Effect} from "@ngrx/effects";
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}


@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions,
              private router: Router,
              private http: HttpClient) {
  }

  apiKey = 'AIzaSyCAOyDlccMc-zYoAcp8zBBG_Thb3O1Jd-Y';

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
          map(resData => {
              const expirationDate = new Date(new Date().getTime() + 1000 * +resData.expiresIn);

              // Note: Not using of() here because map automatically wrap return in
              // an observable

              return new AuthActions.Login(
                {
                  email: resData.email,
                  userId: resData.localId,
                  token: resData.idToken,
                  expirationDate: expirationDate
                });
            }
          ),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessage = "Something went wrong";

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
            return of(new AuthActions.LoginFail(errorMessage));
          })
        )
    }),
  );


  // Let ngrx effect know that this function will not return any observable
  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap(() => {
      this.router.navigate(['/'])
    })
  )


}



















