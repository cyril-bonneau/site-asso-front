/**
 * Point d'entrée de l'application React.
 *
 * Monte le composant App dans l'élément #root du fichier index.html.
 * StrictMode est activé pour détecter les problèmes potentiels en développement
 * (double invocation des effets, API dépréciées, etc.).
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Récupération de l'élément DOM racine défini dans index.html
const rootElement = document.getElementById("root");

// Vérification explicite : si #root est absent, l'application ne peut pas démarrer
if (rootElement === null) {
  throw new Error(
    'Élément #root introuvable dans le DOM. ' +
    'Vérifiez que index.html contient bien <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
