import mongoose from 'mongoose';
import { Country, State, City } from '../Models/lookupData.model.js';
import connectDB from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const __dirname = path.resolve();
const rawDataDir = path.join(__dirname, 'data', 'raw');
const INDIA_COUNTRY_NAME = 'India';
const INDIA_ISO2_CODE = 'IN';

const importData = async () => {
    await connectDB();

    try {
        console.log('--- Starting India Location Data Import to MongoDB ---');

        console.log('Loading global location data from data/raw...');
        const countriesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'countries.json'), 'utf-8'));
        const statesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'states.json'), 'utf-8'));
        const citiesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'cities.json'), 'utf-8'));
        console.log('Global location data loaded.');

        console.log('Cleaning up old Country, State, City data in MongoDB...');
        await Country.deleteMany({});
        await State.deleteMany({});
        await City.deleteMany({});
        console.log('Old Country, State, City data cleared.');

        console.log(`Filtering for ${INDIA_COUNTRY_NAME} and importing country...`);
        const indiaCountryRaw = countriesData.find(c => c.iso2 === INDIA_ISO2_CODE);
        if (!indiaCountryRaw) {
            console.error(`Error: ${INDIA_COUNTRY_NAME} data not found in global countries.json.`);
            return;
        }

        let importedIndiaCountry;
        try {
            importedIndiaCountry = new Country({
                name: indiaCountryRaw.name,
                iso2: indiaCountryRaw.iso2,
                iso3: indiaCountryRaw.iso3,
                phone_code: indiaCountryRaw.phone_code,
            });
            await importedIndiaCountry.save();
            console.log(`✅ ${INDIA_COUNTRY_NAME} imported.`);
        } catch (err) {
            console.error(`Error importing ${INDIA_COUNTRY_NAME}:`, err.message);
            return;
        }

        console.log(`Importing states for ${INDIA_COUNTRY_NAME}...`);
        const indianStatesRaw = statesData.filter(s => s.country_id === indiaCountryRaw.id);
        const statesMap = {};

        for (const sData of indianStatesRaw) {
            try {
                const state = new State({
                    name: sData.name,
                    country: importedIndiaCountry._id,
                    iso2: sData.iso2,
                });
                await state.save();
                statesMap[sData.id] = state._id;
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) { process.stdout.write('D'); }
                else { console.error(`Error importing state ${sData.name}:`, err.message); }
            }
        }
        console.log('\n✅ India States Imported.');

        console.log(`Importing cities for ${INDIA_COUNTRY_NAME} states...`);
        const indianCitiesRaw = citiesData.filter(city => statesMap[city.state_id]);

        for (const cData of indianCitiesRaw) {
            try {
                const city = new City({
                    name: cData.name,
                    state: statesMap[cData.state_id],
                    country: importedIndiaCountry._id,
                });
                await city.save();
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) { process.stdout.write('D'); }
                else { console.error(`Error importing city ${cData.name}:`, err.message); }
            }
        }
        console.log('\n✅ India Cities Imported. Data import complete!');

    } catch (error) {
        console.error('Error during India location data import:', error);
        console.error("Please ensure you have countries.json, states.json, cities.json in the 'data/raw' folder and they are valid JSON.");
    } finally {
        mongoose.connection.close();
    }
};

importData();