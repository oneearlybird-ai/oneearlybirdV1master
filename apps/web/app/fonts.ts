import { Inter, Plus_Jakarta_Sans } from "next/font/google";

export const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const stellarFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
