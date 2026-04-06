import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

try {
  const storedTheme = localStorage.getItem("monstrolingo-theme");
  const initialTheme = storedTheme === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", initialTheme === "dark");
} catch {
  document.documentElement.classList.add("dark");
}

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
