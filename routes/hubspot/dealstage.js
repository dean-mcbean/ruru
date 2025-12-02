const fetchDeal = require('../../fetch/hubspot/get_deal.js');
const { createProject } = require('../../dispatch/runn/project.js');

const recieveDealStageChange = async (dealStageChange) => {
  // Fetch hubspot project
  const { objectId: dealId, occurredAt } = dealStageChange;
  // Convert occurredAt from UTC to dd/mm/yy hh:mm
  const date = new Date(occurredAt);
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${
    (date.getMonth() + 1).toString().padStart(2, '0')}/${
    date.getFullYear().toString().slice(-2)} ${
    date.getHours().toString().padStart(2, '0')}:${
    date.getMinutes().toString().padStart(2, '0')}`;
  console.log(`Received deal stage change for deal ${dealId} at ${formattedDate}`);
  const deal = await fetchDeal(dealId);
  console.log('Fetched deal:', deal);

  
  // 66925 = Chantelle, 704049 = the TBD client
  await createProject(deal.properties.dealname, null, [66925], 704049).catch((error) => {
    console.error("Error in createProject:", error.response);
  });

  return deal;
}

module.exports = {
  recieveDealStageChange
};