import { TodoApi } from "./api";
import { Configuration } from "./configuration";

export const apiClientFactory = (): TodoApi => {
  const config = new Configuration();

  config.isJsonMime("application/json");

  config.basePath = "https://localhost:7239";

  return new TodoApi(config);
};
