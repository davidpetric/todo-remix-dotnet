import { TodoApi } from "./api";
import { Configuration } from "./configuration";

export const apiClient = (): TodoApi => {
  const config = new Configuration();
  config.basePath = "https://localhost:7239";

  return new TodoApi(config);
};
