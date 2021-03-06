import type { NextPage, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useRef, useState } from "react";
import { Collection, CollectionResponse } from "../interfaces/icyTools";
import CollectionView from "../components/CollectionView";
import styles from "../styles/Home.module.css";

function shuffleArray(array: Collection[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const getStaticProps: GetStaticProps = async () => {
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
  const collections = collectionData.data.contracts.edges.filter(
    (edge) => edge.node.unsafeOpenseaImageUrl !== undefined
  );

  return {
    props: { ethToCad, collections }, // will be passed to the page component as props
    revalidate: 86400, // 1 day
  };
};

const Home: NextPage = ({
  ethToCad,
  collections,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [nftCollections, setNftColletions] = useState(collections);
  const [currentIndex, setCurrentIndex] = useState(0);
  const score = useRef(0);

  const nftCollection = nftCollections[currentIndex];
  const nftCollectionNext = nftCollections[currentIndex + 1];

  function nextCollection() {
    setCurrentIndex((index) => {
      if (index === nftCollections.length - 2) return 0;
      else return index + 1;
    });
  }

  function guessPrice(higher: boolean) {
    if (
      nftCollectionNext.node.stats.average >
        nftCollection.node.stats.average ===
      higher
    )
      score.current = score.current + 1;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <button
          style={{ fontSize: "26px", margin: "1rem" }}
          onClick={() => {
            score.current = 0;
            setNftColletions(shuffleArray(nftCollections));
          }}
        >
          Restart
        </button>
        <div style={{ display: "flex" }}>
          <CollectionView collection={nftCollection} ethToCAD={ethToCad} />
          <div style={{ width: "50px" }} />
          <CollectionView
            collection={nftCollectionNext}
            ethToCAD={ethToCad}
            showPrice={false}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "1rem",
          }}
        >
          <button
            style={{ fontSize: "26px", margin: "0.5rem" }}
            onClick={() => {
              guessPrice(true);
              nextCollection();
            }}
          >
            Higher
          </button>
          <button
            style={{ fontSize: "26px", margin: "0.5rem" }}
            onClick={() => {
              guessPrice(false);
              nextCollection();
            }}
          >
            Lower
          </button>
        </div>
        <h1>Score: {score.current}</h1>
      </main>
    </div>
  );
};

export default Home;
