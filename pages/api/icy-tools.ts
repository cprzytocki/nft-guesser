// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Collection, CollectionResponse } from "../../interfaces/icyTools";

type Data = {
  ethToCad: number;
  collections: Collection[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const currencyRes = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=cad&ids=ethereum"
  );

  const currencyData = await currencyRes.json();

  const ethToCad: number = currencyData[0].current_price;

  const collectionRes = await fetch("https://graphql.icy.tools/graphql", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-api-key": `${process.env.ICY_TOOLS_KEY}`,
      Referer: "https://developers.icy.tools/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: '{"query":"\\n  query TrendingCollections {\\n    contracts(orderBy: SALES, orderDirection: DESC, first: 100) {\\n      edges {\\n        node {\\n          address\\n          ... on ERC721Contract {\\n            name\\n            stats {\\n              totalSales\\n              average\\n              ceiling\\n              floor\\n              volume\\n            }\\n            unsafeOpenseaImageUrl\\n            symbol\\n          }\\n        }\\n      }\\n    }\\n  }\\n  ","variables":{},"operationName":"TrendingCollections"}',
    method: "POST",
  });

  const collectionData: CollectionResponse = await collectionRes.json();

  const collections = collectionData.data.contracts.edges;
  console.log(ethToCad);
  res.status(200).json({ ethToCad, collections });
}
