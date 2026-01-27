import "dotenv/config";

export const appConfig = {
  get pythonServiceUrl() {
    if (!process.env.PYTHON_SERVICE_URL)
      throw new Error("PYTHON_SERVICE_URL is not set");

    return process.env.PYTHON_SERVICE_URL;
  },
};
