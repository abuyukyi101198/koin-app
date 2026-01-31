import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "@/styles/index.css";

function App() {
  const [coins, setCoins] = useState([]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setCoins(await invoke("get_coins"));
  }

  return (
    <main className="container">
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <button type="submit">Greet</button>
      </form>
      <p>{coins.map(c => c.title)}</p>
    </main>
  );
}

export default App;
