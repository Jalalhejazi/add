# ![add](./svg/add.svg) add = ![angular](./svg/angular.svg) angular ![drash](./svg/drash.svg) drash ![deno](./svg/deno.svg) deno

### outcome

[angular](https://angular.io/) app running on [deno](https://deno.land/) using [drash](https://drash.land/)

### prerequisites

- [angular cli 9.1.3](https://angular.io/cli)
- [deno 0.41.0](https://deno.land/)

### dependencies

- [drash 0.41.1](https://drash.land)

## project

create project and step into it

```console
mkdir project
cd project
```

## drash server

create [./deps.ts](./deps.ts)

```typescript
export { Drash } from 'https://deno.land/x/drash@v0.41.1/mod.ts';
export const Add = { api: '0.0.1', path: '/add' };
```

create [./add/index.html](./add/index.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>add</title>
  </head>
  <body>
    hello add!
  </body>
</html>
```

create [./root/root.resource.ts](./root/root.resource.ts)

```typescript
import { Drash, Add } from '../deps.ts';

export class RootResource extends Drash.Http.Resource {
  static paths = ['/'];

  public GET() {
    try {
      const raw = Deno.readFileSync(`.${Add.path}/index.html`);
      this.response.body = new TextDecoder().decode(raw);
      this.response.headers.set('Content-Type', 'text/html');
      return this.response;
    } catch (error) {
      throw new Drash.Exceptions.HttpException(400, 'index error');
    }
  }
}
```

create [./app.ts](./app.ts)

```typescript
import { Drash, Add } from './deps.ts';
import { RootResource } from './root/root.resource.ts';

const server = new Drash.Http.Server({
  response_output: 'text/html',
  resources: [RootResource],
  directory: '.',
  static_paths: [Add.path],
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: true,
    level: 'debug',
    tag_string: '{level} |',
  }),
});

server.run({
  hostname: 'localhost',
  port: 1447,
});

server.logger.info('running...');
```

execute from project [./](./) to start drash server

```console
deno --allow-net --allow-read=add app.ts
```

you should get back

```console
INFO | running...
```

execute from project [./](./)

```console
curl localhost:1447
```

you should get back your [./app/index.html](./app/index.html)

execute from project [./](./) to get back same result

```console
curl localhost:1447/
curl localhost:1447/add/index.html
```

execute from project [./](./)

```console
curl localhost:1447/add
```

you should get back nothing because pretty links are not enabled

edit [./app.ts](./app.ts), add to drash server config pretty_links and restart drash server

```typescript
pretty_links: true,
```

execute from project [./](./)

```console
curl localhost:1447/add
```

you should get back ./app/index.html again

create [./api/api.resource.ts](./api/api.resource.ts)

```typescript
import { Drash, Add } from '../deps.ts';

export class ApiResource extends Drash.Http.Resource {
  static paths = ['/api/?'];

  constructor(request: any, response: Drash.Http.Response, server: Drash.Http.Server) {
    super(request, response, server);
    response.headers.set('Content-Type', 'application/json');
  }

  public GET() {
    this.response.body = { ...Deno.version, api: Add.api };
    return this.response;
  }
}
```

edit [./app.ts](./app.ts), drash server config resources and restart drash server

```typescript
resources: [RootResource, ApiResource],
```

restart drash server and execute from project [./](./)

```console
curl localhost:1447/api
```

or

```console
curl localhost:1447/api/
```

you should get back

```console
{"deno":"0.41.0","v8":"8.2.308","typescript":"3.8.3","api":"0.0.1"}
```

execute from project [./](./) to generate a default angular cli app

```console
ng new web
```

answer interactive questions

```
? Would you like to add Angular routing? y
? Which stylesheet format would you like to use? scss
```

step into generated directory [./web](./web)

```console
cd web
```

execute from [./web](./web) to serve angular app with built in server

```console
ng serve
```

open in browser http://localhost:4200/ to see default angular cli app. kill `ng serve` process when done.

execute from [./web](./web) to build optimised app to [./app](./app)

```console
ng build --prod --output-path ../add --base-href /add/
```

angular cli prod build has differential loading support so both es5 and es2015 assets are generated and copied to [./app](./app) thanks to output path flag, client browser determines which will be served. base href flag updates index.html with `<base href="/add/">`

restart drash server and open in browser http://localhost:1447/ to see default angular cli app served by drash

execute from [./web](./web)

```console
ng g module route1 --module app --route route1
```

and

```console
ng g module route2 --module app --route route2
```

edit [./web/app.module.ts](./web/app.module.ts), replace with

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

edit [./web/app.component.ts](./web/app.component.ts), replace with

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  $store = this.http.get('/api').pipe(map((next) => ({ add: '0.0.1', ...next })));

  constructor(private http: HttpClient) {}
}
```

edit [./web/app.component.html](./web/app.component.html), replace with

```html
<button [routerLink]="['/route1']">
  route1
</button>
<button [routerLink]="['/route2']">
  route2
</button>
<router-outlet></router-outlet>
{{ $store | async | json }}
```

create [./web/proxy.conf.json](./web/proxy.conf.json)

```json
{
  "/api": {
    "target": "http://localhost:1447",
    "secure": false
  }
}
```

make sure drash server is running, execute from [./web](./web)

```console
ng serve --proxyConfig proxy.conf.json
```

open in browser `http://localhost:4200/` to see app served with angular cli built in server, and api call proxied to drash `http://localhost:1447/api`. click on buttons to navigate to routes 1 and 2, note the url changes, or navigate directly to urls `http://localhost:4200/route1` or `http://localhost:4200/route2` to test deeplinking. kill `ng serve` process when done.

execute from [./web](./web) to build optimised app to [./app](./app) again

```console
ng build --prod --output-path ../add --base-href /add/
```

restart drash server and open in browser `http://localhost:1447/` to see app served with drash. `http://localhost:1447/add` and `http://localhost:1447/add/` also works. navigate to `http://localhost:1447/add/route1` and refresh the page, you should get back `Not Found`

edit [./app.ts](./app.ts) replace with

```typescript
import { Drash, Add } from './deps.ts';
import { RootResource } from './root/root.resource.ts';
import { ApiResource } from './api/api.resource.ts';

export class AppServer extends Drash.Http.Server {
  public handleHttpRequestError(
    request: any,
    error: any,
    resource: Drash.Http.Resource | any = {},
    response: Drash.Http.Response | any = {}
  ): any {
    if (resource) {
      if (!response) {
        if (typeof resource[request.method.toUpperCase()] !== 'function') {
          error = new Drash.Exceptions.HttpException(405);
        }
      }
    }
    response = new Drash.Http.Response(request);
    response.status_code = error.code ?? null;
    response.body = error.message ?? response.getStatusMessage();
    if (error.code === 404) {
      const routed = /^(\/\w+)(\/\w*)*$/i.exec(request.url_path);
      if (routed && this.static_paths.includes(routed[1])) {
        response.status_code = 200;
        response.headers.set('Content-Type', 'text/html');
        response.body = new TextDecoder().decode(Deno.readFileSync(`.${routed[1]}/index.html`));
      }
    }
    try {
      this.executeMiddlewareServerLevelAfterRequest(request, null, response);
    } catch (error) {
      // do nothing
    }
    return response.send();
  }
}

const server = new AppServer({
  response_output: 'text/html',
  resources: [RootResource, ApiResource],
  directory: '.',
  static_paths: [Add.path],
  pretty_links: true,
  logger: new Drash.CoreLoggers.ConsoleLogger({
    enabled: true,
    level: 'debug',
    tag_string: '{level} |',
  }),
});

server.run({
  hostname: 'localhost',
  port: 1447,
});

server.logger.info('running...');
```

restart drash server and open in browser `http://localhost:1447/` to see app served with drash and working deeplinking
