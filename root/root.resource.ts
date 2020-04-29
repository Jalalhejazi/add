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
