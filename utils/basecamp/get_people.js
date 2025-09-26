
const axios = require('axios');

const getPeople = async (basecampToken, nextPageLink) => {
  try {
    // Call the users.list method using the WebClient
    const basecampPromise = axios.get(nextPageLink || 'https://3.basecampapi.com/6024739/people.json', {
        headers: {
          'Authorization': `Bearer ${basecampToken}`,
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'Ruru (dean.walker@urbanintelligence.com)'
        }
      })
    const result = await basecampPromise;
    const followingPageLink = result.headers['link']?.split(';')[0]?.trim()?.slice(1, -1);
    const resultPeople = result.data;

    if (followingPageLink) {
      const nextPagePeople = await getPeople(basecampToken, followingPageLink);
      console.log('NEXT PAGE PEOPLE', followingPageLink);
      resultPeople.push(...nextPagePeople);
    }

    return resultPeople;
  } catch (error) {
    console.error(error);
  }
};

module.exports = getPeople;