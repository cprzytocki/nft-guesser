import React from "react";
import Image from "next/image";
import { Collection } from "../interfaces/icyTools";
import styles from "../styles/Home.module.css";

interface IProps {
  collection: Collection;
  ethToCAD: number;
  showPrice?: boolean;
}

export default function CollectionView({
  collection,
  ethToCAD,
  showPrice = true,
}: IProps) {
  return (
    <div
      style={{ display: "table-cell", verticalAlign: "bottom" }}
      key={collection.node.unsafeOpenseaImageUrl}
      className={styles.animate}
    >
      <h1>{collection.node.name}</h1>
      <h2>
        {showPrice
          ? `$${(collection.node.stats.average * ethToCAD).toFixed(2)}`
          : "?"}
      </h2>
      <Image
        src={collection.node.unsafeOpenseaImageUrl || ""}
        alt="Vercel Logo"
        width={400}
        height={400}
      />
    </div>
  );
}
