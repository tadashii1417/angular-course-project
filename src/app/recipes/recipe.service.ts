import {EventEmitter, Injectable} from "@angular/core";
import {Recipe} from "./recipe.model";
import {Ingredient} from "../shared/ingredient.model";
import {Subject} from "rxjs";
import {Store} from "@ngrx/store";
import * as ShoppingListActions from '../shopping-list/store/shopping-list.action';
import * as fromShoppingList from "../shopping-list/store/shopping-list.reducer";

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private _recipes: Recipe[] = [];

  constructor(
    private store: Store<fromShoppingList.AppState>) {
  }

  setRecipes(recipes: Recipe[]) {
    this._recipes = recipes;
    this.recipesChanged.next(this._recipes.slice());
  }

  getRecipes(): Recipe[] {
    return this._recipes.slice();
  }

  getRecipeById(id): Recipe {
    const index = this._recipes.findIndex(recipe => recipe.id === id);
    return this._recipes[index];
  }

  addRecipe(recipe: Recipe) {
    this._recipes.push(recipe);
    this.recipesChanged.next(this._recipes.slice());
  }

  updateRecipe(index, newRecipe: Recipe) {
    this._recipes[index] = newRecipe;
    this.recipesChanged.next(this._recipes.slice());
  }

  deleteRecipe(index) {
    this._recipes.splice(index, 1);
    this.recipesChanged.next(this._recipes.slice());
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]) {
    this.store.dispatch(new ShoppingListActions.AddIngredients((ingredients)))
  }
}
