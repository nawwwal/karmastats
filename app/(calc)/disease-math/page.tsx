import { Metadata } from "next";
import { DiseaseMathPage } from "@/components/disease-math/DiseaseMathPage";

export const metadata: Metadata = {
  title: "Infectious Disease Modeling | Karmastat",
  description: "Model and simulate infectious disease spread using advanced mathematical models",
};

export default function Page() {
  return <DiseaseMathPage />;
}
