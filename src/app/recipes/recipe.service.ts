import {EventEmitter, Injectable} from "@angular/core";
import {Recipe} from "./recipe.model";
import {Ingredient} from "../shared/ingredient.model";
import {ShoppingListService} from "../shopping-list/shopping-list.service";
import {Subject} from "rxjs";
import {DataStorageService} from "../shared/data-storage.service";

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  // private _recipes: Recipe[] = [
  //   new Recipe(
  //     0,
  //     'A Test Recipe',
  //     'This is simple a test',
  //     'https://www.bbcgoodfood.com/sites/default/files/recipe-collections/collection-image/2013/05/spaghetti-puttanesca_1.jpg',
  //     [
  //       new Ingredient('Meat', 1),
  //       new Ingredient('French Fires', 20)
  //     ])
  //   , new Recipe(
  //     1,
  //     'A Test Burger',
  //     'What else you need to say ?',
  //     'https://static01.nyt.com/images/2019/01/17/dining/mc-red-lentil-soup/merlin_146234352_d7bc8486-b067-4cff-a4c0-7741f166fb60-articleLarge.jpg',
  //     [
  //       new Ingredient('Buns', 1),
  //       new Ingredient('Meat', 20)
  //     ])
  // ];

  private _recipes: Recipe[] = [];

  constructor(private shoppingListService: ShoppingListService) {
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
    this.shoppingListService.addIngredients(ingredients);
  }
}
