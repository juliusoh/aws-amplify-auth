/**
 * Required parameter error handler
 */

export default class RequiredParameterException extends Error {
  code: string;

  parameterName: string;

  constructor(message: string, parameterName: string) {
    super(message);

    this.code = 'RequiredParameterException';
    this.parameterName = parameterName;
    this.name = this.constructor.name;
  }
}
