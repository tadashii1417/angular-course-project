import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {RecipeService} from "../recipes/recipe.service";
import {Recipe} from "../recipes/recipe.model";
import {exhaustMap, map, take, tap} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {AppState} from "../store/app.reducer";
import * as RecipeActions from "../recipes/store/recipe.actions";

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  url = 'https://ng-course-recipe-book-422c3.firebaseio.com/';

  constructor(
    private http: HttpClient,
    private store: Store<AppState>,
    private recipeService: RecipeService) {
  }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(this.url + 'recipes.json', recipes)
      .subscribe(res => console.log(res));
  }

  fetchRecipes() {
    return this.http
      .get<Recipe[]>(this.url + 'recipes.json')
      .pipe(
        map(recipes => {
          return recipes.map(recipe => {
            return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []}
          })
        }),
        tap(recipes => {
          this.store.dispatch(new RecipeActions.SetRecipes(recipes))
        }))
      ;
  }
}

