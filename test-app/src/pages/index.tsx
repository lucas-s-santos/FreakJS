import type { PageProps } from "freakjs";

export const metadata = {
  title: "test-app",
  description: "Built with FreakJS",
};

export default function Home({ url }: PageProps) {
  return (
    <main>
      <h1>Welcome to FreakJS</h1>
      <p>Edit <code>src/pages/index.tsx</code> to get started.</p>
    </main>
  );
}
