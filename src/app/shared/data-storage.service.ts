import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {RecipeService} from "../recipes/recipe.service";
import {Recipe} from "../recipes/recipe.model";
import {map, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  url = 'https://ng-course-recipe-book-422c3.firebaseio.com/';

  constructor(private http: HttpClient, private recipeService: RecipeService) {
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
          this.recipeService.setRecipes(recipes);
        }))
      ;
  }
}
