import Head from "next/head";
import styles from "../styles/Home.module.css";
import TopMenu from "../components/TopMenu";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>OPEN-FTTH</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <TopMenu />

      <main className={styles.main}>
        <h1 className={styles.title}>Body</h1>
      </main>
    </div>
  );
}
