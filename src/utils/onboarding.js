const ROLE_HOME = {
  business_owner: "/dashboard",
  owner: "/dashboard",
  employee: "/employee-dashboard",
  supplier: "/supplier-dashboard",
};

const ROLE_SETUP = {
  business_owner: "/setup-business",
  employee: "/employee-invites",
  supplier: "/setup-supplier",
};

export const getHomeRoute = (role) => (role && ROLE_HOME[role]) || "/role";
export const getSetupRoute = (role) => ROLE_SETUP[role] || "/role";
