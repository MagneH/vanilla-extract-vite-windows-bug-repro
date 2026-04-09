import { box } from "../../../packages/shared/src/block";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Expected #root to exist.");
}

root.innerHTML = `
  <main class="${box}">
    <h1>vanilla-extract Windows @id repro</h1>
    <p>
      Visit <a href="/__repro">/__repro</a> while the dev server is running to exercise the plugin with an @id-wrapped absolute file path.
    </p>
  </main>
`;
