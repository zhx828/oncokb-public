import * as request from "superagent";
import { IndicatorQueryResp } from "app/shared/api/generated/OncoKbAPI";

type CallbackHandler = (err: any, res ?: request.Response) => void;
export type VariantRecorderResponse = {
  hgvsc: string[],
  id: string[],
  hgvsp: string[],
  hgvsg: string[],
  spdi: string[],
  input: string
}

export default class EnsemblAPI {

  private domain: string = "";
  private errorHandlers: CallbackHandler[] = [];

  constructor(domain ?: string) {
    if (domain) {
      this.domain = domain;
    }
  }

  getDomain() {
    return this.domain;
  }

  addErrorHandler(handler: CallbackHandler) {
    this.errorHandlers.push(handler);
  }

  private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler, errorHandlers: CallbackHandler[]) {
    let req = (new (request as any).Request(method, url) as request.Request)
      .query(queryParameters);
    Object.keys(headers).forEach(key => {
      req.set(key, headers[key]);
    });

    if (body) {
      req.send(body);
    }

    if (typeof (body) === "object" && !(body.constructor.name === "Buffer")) {
      req.set("Content-Type", "application/json");
    }

    if (Object.keys(form).length > 0) {
      req.type("form");
      req.send(form);
    }

    req.end((error, response) => {
      if (error || !response.ok) {
        reject(error);
        errorHandlers.forEach(handler => handler(error));
      } else {
        resolve(response);
      }
    });
  }


  variantRecorderGetUsingGETWithHttpInfo(parameters: {
    "id": string,
    "refGenmoe"?: string,
    $queryParameters?: any,
    $domain?: string
  }): Promise<request.Response> {
    const domain = parameters.$domain ? parameters.$domain : this.domain;
    const errorHandlers = this.errorHandlers;
    const request = this.request;
    let path = "/variant_recoder/human";
    let body: any;
    let queryParameters: any = {};
    let headers: any = {};
    let form: any = {};
    return new Promise(function(resolve, reject) {
      headers["Accept"] = "application/json";
      headers["Content-Type"] = "application/json";

      if (parameters.id !== undefined) {
        path = `${path}/${parameters.id}`;
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          var parameter = parameters.$queryParameters[parameterName];
          queryParameters[parameterName] = parameter;
        });
      }

      request("GET", domain + path, body, headers, queryParameters, form, reject, resolve, errorHandlers);

    });
  };

  variantRecorderUsingGET(parameters: {
    "id": string,
    "refGenmoe"?: string,
    $queryParameters?: any,
    $domain?: string
  }): Promise<VariantRecorderResponse[]> {
    return this.variantRecorderGetUsingGETWithHttpInfo(parameters).then(function(response: request.Response) {
      return response.body;
    });
  };
}
