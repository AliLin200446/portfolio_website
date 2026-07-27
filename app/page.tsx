import HomeShell from "@/components/bench/HomeShell";
import IndexBodyFlag from "@/components/IndexBodyFlag";

/*
 * THE BENCH — v2 homepage skeleton (相A).
 * The previous homepage and its data file are gone: the route was
 * unlinked but publicly loadable, and carried a named third-party
 * brand, a struck overclaim, and an italic that the type law forbids.
 */
export default function Home() {
  return (
    <main>
      <>
      <IndexBodyFlag />
      <HomeShell />
    </>
    </main>
  );
}
