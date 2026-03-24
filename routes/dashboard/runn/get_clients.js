const getClients = require("../../../fetch/runn/get_clients.js");

const getRunnClients = async (req, res) => {
  const clients = await getClients();
  console.log(clients);
  if (!clients) {
    return res.status(404).send("No clients found");
  }
  res.send(clients);
};

module.exports = getRunnClients;
