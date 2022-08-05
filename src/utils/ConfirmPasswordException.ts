/**
 * Confirm Password Error Handler
 */
export default class ConfirmPasswordException extends Error {
  code: string;

  constructor(message: string) {
    super(message);
    this.code = 'ConfirmPasswordException';
    this.name = this.constructor.name;
  }
}
