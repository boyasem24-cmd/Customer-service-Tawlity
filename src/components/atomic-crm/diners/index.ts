import type { Diner } from "../types";
import { DinerCreate } from "./DinerCreate";
import { DinerEdit } from "./DinerEdit";
import { DinerList } from "./DinerList";
import { DinerShow } from "./DinerShow";
import { getDinerName } from "./dinerModel";

export default {
  list: DinerList,
  create: DinerCreate,
  edit: DinerEdit,
  show: DinerShow,
  recordRepresentation: (record: Diner) => getDinerName(record),
};
