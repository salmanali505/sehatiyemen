import { defineMcp } from "@lovable.dev/mcp-js";
import searchProviders from "./tools/search-providers";
import getProvider from "./tools/get-provider";
import listSpecialties from "./tools/list-specialties";
import listCities from "./tools/list-cities";
import listOffers from "./tools/list-offers";

export default defineMcp({
  name: "sehati-mcp",
  title: "Sehati Health Hub",
  version: "0.1.0",
  instructions:
    "Sehati healthcare marketplace. Use these tools to search providers, look up specialties and cities, and browse active offers.",
  tools: [searchProviders, getProvider, listSpecialties, listCities, listOffers],
});
