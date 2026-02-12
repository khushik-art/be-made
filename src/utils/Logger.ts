export class Logger {
  static enabled = false;
  static log(message: string) {
    if (!Logger.enabled) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(message);
  }

  static error(message: string) {
    // eslint-disable-next-line no-console
    console.error(message);
  }

  static warn(message: string) {
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}
