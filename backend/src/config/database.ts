import "reflect-metadata";

import { DataSource } from "typeorm";
import { InterrogationEntity, UserEntity } from "../entities";
import { appConfig } from "./app";

export const appDataSource = new DataSource({
  type: "postgres",
  host: appConfig.postgres.host,
  port: appConfig.postgres.port,
  username: appConfig.postgres.username,
  password: appConfig.postgres.password,
  database: appConfig.postgres.database,
  entities: [UserEntity, InterrogationEntity],
  synchronize: appConfig.postgres.synchronize,
});
