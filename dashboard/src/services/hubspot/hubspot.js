import authAxios from "../axios";

export const getHubspotDeals = async () => {
  const results = await authAxios.get(
    `${process.env.VUE_APP_BASE_API_URL}/hubspot/deals`,
  );
  console.log("Hubspot deals fetched:", results.data);
  return results.data.map((res) => ({
    ...res,
    name: res.properties.dealname,
    createdAt: new Date(res.createdAt),
    updatedAt: new Date(res.updatedAt),
  }));
};
