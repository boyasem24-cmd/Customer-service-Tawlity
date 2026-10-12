// FIXME: This should be exported from the ra-core package
type CanAccessParams<
  RecordType extends Record<string, any> = Record<string, any>,
> = {
  action: string;
  resource: string;
  record?: RecordType;
};

/** Diner (B2C) data is restricted to admins and the support team. */
export const DINER_RESOURCES = ["diners", "diner_notes", "diner_tags"];

export type CrmRole = "admin" | "support" | "user";

export const getRole = (sale: {
  administrator?: boolean;
  support?: boolean;
}): CrmRole =>
  sale.administrator ? "admin" : sale.support ? "support" : "user";

export const canAccess = <
  RecordType extends Record<string, any> = Record<string, any>,
>(
  role: string,
  params: CanAccessParams<RecordType>,
) => {
  if (role === "admin") {
    return true;
  }

  // Diners are visible to admins and support users only
  if (DINER_RESOURCES.includes(params.resource)) {
    return role === "support";
  }

  // Non admins can't access the sales resource
  if (params.resource === "sales") {
    return false;
  }

  // Non admins can't access the configuration resource
  if (params.resource === "configuration") {
    return false;
  }

  return true;
};
