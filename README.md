# AAA

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Leerdoelen Angular

### 1. ng
- **Material**: Toegepast op het menu/toolbar, buttons, tables, dialogs en forms. 
- **Reactive forms**: FormGroup geïnitiliseerd in de `new-customer.component` en `new-breakdown.component`. Ik gebruik Material Dialog in combinatie met Reactive forms om de ingevulde gegevens door te sturen. Tevens herbruik ik deze componenten (dialogs), naast het aanmaken, voor het wijzigen en verwijderen van data middels een "mode" property die wordt doorgegeven via de dialog data.
- **Dependency Injection**: Met inject() worden er afhankelijkheden geïnjecteerd zoals de Angular services ActivatedRoute, DestroyRef en MatDialog maar ook eigen services zoals `customers.service`, `breakdowns.service`.
- **Services**: Eigen services zoals de `customers.service`, `breakdowns.service` worden gebruikt om de logica en data te beheren. Hierin staan de methoden voor de CRUD operaties die via Angular's HttpClient communiceren met de backend.
- **Components**: De applicatie bestaat uit meerdere (standalone) componenten. Dit zijn de bouwstenen van de UI.
- **Templates**: De templates bestaan uit HTML en Angular specifieke syntax en bepalen hoe de componenten worden weergegeven in de UI.
- **Routing**: Routes zijn gedefinieerd in `app.routes.ts`. Met routerLink zijn deze toegepast in bijv. de `menu-component`. Sorteren van data in de mat-tables gaat via de queryParams Observable die wordt geleverd door Angular's ActivatedRoute. De parameters worden weergegeven in de url. 
- **NG CLI**: Voor het aanmaken van de componenten, en voor installaties zoals bijv. jest, is gebruik gemaakt van de CLI.

### 2. rxjs
- **Pipelines**: In de `customers.component`, de `breakdowns.component` en de `services` maak ik gebruik van RxJS pipelines om de observable te transformeren of manipuleren met behulp van RxJS pipe().  
- **Observables**: In o.a. de get, add, edit en delete functies wordt er met subscribe() aangemeld voor updates van de observables. 
- **Subjects**: Udemy 201, 209, 210.
- **Operators**: In bijv. de `customers.service` gebruik ik de map() operator om de Customers[] array uit het { customers: Customer[] } object te halen en de tap() operator om side-effects uit te voeren, zoials logging of updates, buiten de data stroom van de obervable zelf. 
- **Error handling**: In de http-verzoeken worden mogelijke fouten afgevangen en vooralsnog alleen gelogd. De validators in de formulieren richten zich op de gebruikersinvoer. 

### 3. Jest
- **Matchers**:
- **Setup & Teardown**:
- **Mocks**: