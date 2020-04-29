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
