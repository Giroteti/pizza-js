# Pizza : An OOP refactoring Kata

## Business

Handle a pizza order: a customer orders a pizza from pizzeria.

For an order to be fulfilled :
- The chosen pizza must be on the chosen pizzeria's menu
- The pizzeria must have enough ingredients in its inventory to cook the pizza
- The payment of the pizza's price from the customer must be successful

## Technicalities
As input, the system receives : a `customerId`, a `pizzeriaId` and a `pizzaFlavorId`.
The existence of the customer and pizzeria must be checked and might fail.
At the end of the process the order and its status (fulfilled or failed) must be recorded.

## Initial situation
The initial situation reflects a rather poor software design.

### Database-driven
Here below is the relational data model:
<p align="center">
    <img src="/docs/relational.png" />
</p>
 
As you will notice in the `OrderAPizza` usecase, there is a one-to-one mapping between tables and repository and therefore "entities" as well.

This kind of sofware design is not desirable as relational design's goal is to ensure consistency and atomicity for persistence whereas software design is about completely different concerns : loose coupling, understandability and abstraction. Therefore a good relational design is not a good software design.
For exemple, in the current situation changes in the way data is stored is likely to imply changes in the software as well (e.g. if tables are splited, merged or renamed) which indicate tight coupling.

### Lacks of encapsulation
Domain entities (`Pizzeria`, `Customer`, `Inventory`, ...) are only seen as bags of data. They have no methods, they do not encapsulate business logic. 
Even though there are some classes, it is a rather procedural than object-oriented. 

## Goal
Without changing the relational model (i.e. `/app/infrastructure/tables`) refactor the usecase, repositories and entities to achieve a better object-oriented software design : 
- Decoupled from the way data is persisted
- Better abstractions and encapsultation

## Some content to guide your refactoring
- [Aenemic domain](https://martinfowler.com/bliki/AnemicDomainModel.html) 
- [Object calisthenics](https://williamdurand.fr/2013/06/03/object-calisthenics/)
- [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter)
- [Tell don't ask](https://martinfowler.com/bliki/TellDontAsk.html)
- [Aggregate](https://dddcommunity.org/library/vernon_2011/)
