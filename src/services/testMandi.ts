
import { getMandiPrices } from "./mandiService";

async function testMandiAPI() {
  try {
    const records = await getMandiPrices({
      state: "Uttar Pradesh",
      commodity: "Wheat",
    });

    console.log("Total records:", records.length);
    console.log("Mandi records:", records);
  } catch (error) {
    console.error("Mandi API failed:", error);
  }
}

testMandiAPI();
