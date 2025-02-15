import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "https://store-site-backend-static.ak.epicgames.com/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    games: {
      endpoint: "freeGamesPromotions",
    },
  },
};

export default widget;
