import {Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthResponseData, AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {AppState} from "../store/app.reducer";
import * as AuthActions from "./store/auth.actions";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  isLoading = false;
  isLoginMode = true;
  error = null;

  constructor(
    private authService: AuthService,
    private store: Store<AppState>,
    private router: Router) {
  }

  ngOnInit(): void {
    this.store.select('auth').subscribe(authState => {
        this.isLoading = authState.loading;
        this.error = authState.authError;
    })
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(authForm: NgForm) {
    if (!authForm.valid) return;
    const {email, password} = authForm.value;

    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;

    if (this.isLoginMode) {
      // authObs = this.authService.login(email, password);
      this.store.dispatch(new AuthActions.LoginStart({email, password}));
    } else {
      authObs = this.authService.signup(email, password);
    }

    // authObs.subscribe(
    //   data => {
    //     this.isLoading = false;
    //     this.router.navigate(['/recipes']);
    //   },
    //   errorMessage => {
    //     this.error = errorMessage;
    //     this.isLoading = false;
    //   })

    authForm.reset();
  }
}
