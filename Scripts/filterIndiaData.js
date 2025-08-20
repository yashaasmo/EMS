import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const __dirname = path.resolve();
const rawDataDir = path.join(__dirname, 'data', 'raw');
const processedDataDir = path.join(__dirname, 'data', 'processed');

const INDIA_COUNTRY_NAME = 'India';
const INDIA_ISO2_CODE = 'IN';

const filterAndSaveData = async () => {
  try {
    await fs.mkdir(rawDataDir, { recursive: true });
    await fs.mkdir(processedDataDir, { recursive: true });

    console.log('Loading global data from data/raw...');
    const countriesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'countries.json'), 'utf-8'));
    const statesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'states.json'), 'utf-8'));
    const citiesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'cities.json'), 'utf-8'));
    console.log('Global data loaded.');

    const indiaCountry = countriesData.find(c => c.iso2 === INDIA_ISO2_CODE);
    if (!indiaCountry) {
      console.error(`Error: ${INDIA_COUNTRY_NAME} data not found in global countries.json. Please ensure the file is correct and India exists.`);
      return;
    }
    await fs.writeFile(path.join(processedDataDir, 'india_country.json'), JSON.stringify(indiaCountry, null, 2));
    console.log(`✅ ${INDIA_COUNTRY_NAME} country data saved to data/processed.`);

    const indianStates = statesData.filter(s => s.country_id === indiaCountry.id);
    await fs.writeFile(path.join(processedDataDir, 'india_states.json'), JSON.stringify(indianStates, null, 2));
    console.log(`✅ ${INDIA_COUNTRY_NAME} states data saved to data/processed.`);

    const indianStateIds = new Set(indianStates.map(s => s.id));

    console.log(`Filtering cities for ${INDIA_COUNTRY_NAME} states (this may take a moment)...`);
    const indianCities = citiesData.filter(city => indianStateIds.has(city.state_id));

    await fs.writeFile(path.join(processedDataDir, 'india_cities.json'), JSON.stringify(indianCities, null, 2));
    console.log(`✅ ${INDIA_COUNTRY_NAME} cities data saved to data/processed.`);

    console.log('All India geographical data filtered and saved successfully!');

  } catch (error) {
    console.error("Error filtering or saving India data:", error.message);
    console.error("Please ensure you have countries.json, states.json, cities.json in the 'data/raw' folder and they are valid JSON.");
  }
};

filterAndSaveData();