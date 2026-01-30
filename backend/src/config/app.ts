import "dotenv/config";

export const appConfig = {
  get pythonServiceUrl() {
    if (!process.env.PYTHON_SERVICE_URL)
      throw new Error("PYTHON_SERVICE_URL is not set");

    return process.env.PYTHON_SERVICE_URL;
  },

  postgres: {
    get host() {
      if (!process.env.POSTGRES_HOST)
        throw new Error("POSTGRES_HOST is not set");

      return process.env.POSTGRES_HOST;
    },

    get port() {
      if (!process.env.POSTGRES_PORT)
        throw new Error("POSTGRES_PORT is not set");

      return Number(process.env.POSTGRES_PORT);
    },

    get username() {
      if (!process.env.POSTGRES_USERNAME)
        throw new Error("POSTGRES_USERNAME is not set");

      return process.env.POSTGRES_USERNAME;
    },

    get password() {
      if (!process.env.POSTGRES_PASSWORD)
        throw new Error("POSTGRES_PASSWORD is not set");

      return process.env.POSTGRES_PASSWORD;
    },

    get database() {
      if (!process.env.POSTGRES_DATABASE)
        throw new Error("POSTGRES_DATABASE is not set");

      return process.env.POSTGRES_DATABASE;
    },

    synchronize: process.env.POSTGRES_SYNCHRONIZE === "true",
  },
};
