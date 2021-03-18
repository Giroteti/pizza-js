import { recipesDataTable } from './tables/recipes'
import * as _ from 'lodash'

export class PizzaRecipeRepository {
    private dataSource = _.cloneDeep(recipesDataTable);

    getByPizzaFlavorId(pizzaFlavorId: number) {
        return this.dataSource
            .filter(r => r.pizzaId === pizzaFlavorId)
            .map(r => r.ingredientId);
    }
}
