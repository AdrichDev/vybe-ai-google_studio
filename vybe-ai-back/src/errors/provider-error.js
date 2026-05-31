export class ProviderError extends Error {
  constructor(providerName, message, cause = undefined) {
    super(message);
    this.name = "ProviderError";
    this.providerName = providerName;
    this.cause = cause;
  }
}
