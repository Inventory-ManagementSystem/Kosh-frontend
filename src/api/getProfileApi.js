const GET_PROFILE_API_URL = import.meta.env.VITE_PROFILE_API_URL;

export const getProfile = async (accessToken) => {
  const response = await fetch(GET_PROFILE_API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data;
};
