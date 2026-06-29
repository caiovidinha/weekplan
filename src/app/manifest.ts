import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weekplan",
    short_name: "Weekplan",
    description: "Agenda da semana, treinos, hábitos e nutrição em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#161719",
    theme_color: "#161719",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
