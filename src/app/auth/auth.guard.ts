import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {map, take} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState} from "../store/app.reducer";

@Injectable({providedIn: "root"})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              private store: Store<AppState>,
              private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.store.select("auth").pipe(
      take(1),
      map(authState => {
        return authState.user
      }),
      map(user => {
        const isAuth = !!user;
        if (isAuth) return true;
        // TODO: what is createUrlTree
        return this.router.createUrlTree(['/auth']);
      }));
  }
}
