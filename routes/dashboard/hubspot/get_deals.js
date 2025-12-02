
const getDeals = require("../../../fetch/hubspot/get_deals.js");
const { HUBSPOT } = require("../../../constants.js");

const getHubspotDeals = async (req, res) => {
  const result = await getDeals();
  if (!result || result.length === 0) {
    return res.status(404).send("No deals found");
  }
  const mappedResult = result.flatMap(deal => {
    const saasIndex = HUBSPOT.SAAS.findIndex(stage => stage.id == deal.properties.dealstage);
    const consultingIndex = HUBSPOT.CONSULTING_GRANTS.findIndex(stage => stage.id == deal.properties.dealstage);
    const isSaas = saasIndex !== -1;
    const isConsulting = consultingIndex !== -1;
    const saasStageInvalid = saasIndex < 3 || saasIndex > 6;
    const consultingStageInvalid = consultingIndex < 3 || consultingIndex > 6;
    if ((!isSaas && !isConsulting) || (isSaas && saasStageInvalid) || (isConsulting && consultingStageInvalid)) {
      return [];
    }
    return [{
      ...deal,
      stageLabel: isSaas ? HUBSPOT.SAAS[saasIndex].label : isConsulting ? HUBSPOT.CONSULTING_GRANTS[consultingIndex].label : null,
      pipeline: isSaas ? 'SAAS' : isConsulting ? 'CONSULTING' : null
    }];
  });
  res.send(mappedResult);
}

module.exports = getHubspotDeals;
