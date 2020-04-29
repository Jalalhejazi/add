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
