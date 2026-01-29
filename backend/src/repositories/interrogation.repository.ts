import { appDataSource } from "../config/database";
import { InterrogationEntity } from "../entities";

export const InterrogationRepository = {
  repo() {
    return appDataSource.getRepository(InterrogationEntity);
  },
};
