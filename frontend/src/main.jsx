import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { config } from "@stores/config";
import pages from "./pages";
function App() {
        const [loaded, setLoaded] = useState(false);
        const [message, setMessage] = useState("configuration");
        useEffect(() => config !== null && setLoaded(true), []);
        return (<>
                {!loaded && <pages.Loading message={message} />}
                {loaded && (<>
                        {typeof config == "string" ? (<pages.Errors code={403} reason={config} />) : config === 1 ? (<pages.Errors code={502} />) : (
                                <RouterProvider router={createBrowserRouter([
                                        { path: "*", element: <pages.Errors code={404} /> },
                                        { path: "/", element: <pages.Home /> },
                                        { path: "/login", element: <pages.Authentication type="Login" /> },
                                        { path: "/register", element: <pages.Authentication type="Register" /> },
                                        { path: "/dashboard", element: <pages.Dashboard /> },
                                        { path: "/game", element: <pages.Game /> },
                                        { path: "/game/solo", element: <pages.Game.SoloPlay /> },
                                        { path: "/game/classic", element: <pages.Game.Classic /> },
                                        { path: "/game/goldquest", element: <pages.Game.GoldQuest /> },
                                        { path: "/game/towerdefense", element: <pages.Game.TowerDefense /> },
                                        { path: "/game/battleroyale", element: <pages.Game.BattleRoyale /> },
                                        { path: "/game/factory", element: <pages.Game.Factory /> },
                                        { path: "/game/cafe", element: <pages.Game.Cafe /> },
                                        { path: "/market", element: <pages.Market /> },
                                        { path: "/shop", element: <pages.Shop /> },
                                        { path: "/play", element: <pages.Play /> },
                                        { path: "/chat", element: <pages.Chat /> },
                                        { path: "/u/:username", element: <pages.Profile /> },
                                        { path: "/daily", element: <pages.DailyReward /> }
                                ])} />
                        )}
                </>)}
        </>);
}
createRoot(document.getElementById("app")).render(<App />);
