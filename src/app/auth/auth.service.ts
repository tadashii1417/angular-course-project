import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";
import {BehaviorSubject, throwError} from "rxjs";
import {User} from "./user.model";
import {Router} from "@angular/router";


export interface AuthResponseData {
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  apiKey = 'AIzaSyCAOyDlccMc-zYoAcp8zBBG_Thb3O1Jd-Y';

  constructor(private http: HttpClient, private router: Router) {
  }

  private handleError(errorResponse: HttpErrorResponse) {
    let errorMessage = "Something went wrong";
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
    }
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

    return throwError(errorMessage);
  }

  private handleAuthentication(email, localId, idToken, expiresIn) {
    const expirationDate = new Date(new Date().getTime() + 1000 * +expiresIn);
    const user = new User(
      email,
      localId,
      idToken,
      expirationDate
    );
    localStorage.setItem('userData', JSON.stringify(user));
    this.user.next(user);
    this.autoLogout(+expiresIn * 1000);
  }

  signup(email, password) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`,
        {
          email, password, returnSecureToken: true
        })
      .pipe(
        catchError(this.handleError),
        tap((resData) =>
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            resData.expiresIn
          )
        ))
  }

  login(email, password) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`,
        {email, password, returnSecureToken: true})
      .pipe(
        catchError(this.handleError),
        tap((resData) =>
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            resData.expiresIn
          )
        ))
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      this.tokenExpirationTimer.clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  autoLogin() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const {email, id, _token, _tokenExpirationDate} = userData;
    const loadedUser = new User(email, id, _token, new Date(_tokenExpirationDate));

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = new Date(_tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }
}
