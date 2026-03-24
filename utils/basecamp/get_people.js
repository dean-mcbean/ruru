const axios = require("axios");
const { URLS, BASECAMP } = require("../../constants");

const getPeople = async (basecampToken, nextPageLink) => {
  try {
    const basecampPromise = axios.get(
      nextPageLink || URLS.basecampApiPath("/people.json"),
      {
        headers: {
          Authorization: `Bearer ${basecampToken}`,
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": BASECAMP.USER_AGENT,
        },
      },
    );
    const result = await basecampPromise;
    const followingPageLink = result.headers["link"]
      ?.split(";")[0]
      ?.trim()
      ?.slice(1, -1);
    const resultPeople = result.data;

    if (followingPageLink) {
      const nextPagePeople = await getPeople(basecampToken, followingPageLink);
      console.log("NEXT PAGE PEOPLE", followingPageLink);
      resultPeople.push(...nextPagePeople);
    }

    return resultPeople;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getPeople;
