export default function validateEmail(emailField: string) {
  const reg = /^([A-Za-z0-9_-.])+@([A-Za-z0-9_-.])+.([A-Za-z]{2,4})$/;

  if (reg.test(emailField) === false) {
    return false;
  }

  return true;
}
