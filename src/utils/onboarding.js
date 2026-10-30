import { selectRole } from "../api/selectRoleApi";

const NEXT_STEP_ROUTES = {
  owner_dashboard: "/dashboard",
  employee_dashboard: "/employee-dashboard",
  supplier_dashboard: "/supplier-dashboard",
  setup_business: "/setup-business",
  employee_invites: "/employee-invites",
  setup_supplier: "/setup-supplier",
  select_role: "/role",
};

export const getNextStepRoute = (nextStep) => {
  const route = NEXT_STEP_ROUTES[nextStep];
  if (!route) console.warn("Unknown next_step:", nextStep);
  return route || "/role";
};

export const resolveNextStep = async (data, accessToken) => {
  console.log("resolveNextStep data:", data);

  const pendingRole = localStorage.getItem("selectedRole");
  let nextStep = data?.next_step;
  if (pendingRole && data?.can_change_role !== false) {
    try {
      const response = await selectRole(pendingRole, accessToken);
      nextStep = response.data.next_step;
      localStorage.removeItem("selectedRole");
    } catch (error) {
      console.error("Failed to save selected role:", error);
      if (error.status === 409) {
        localStorage.removeItem("selectedRole");
      }
    }
  } else {
    localStorage.removeItem("selectedRole");
  }

  return getNextStepRoute(nextStep);
};
