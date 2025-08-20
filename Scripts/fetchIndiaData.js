import mongoose from 'mongoose';
import { Country, State, City } from '../Models/lookupData.model.js';
import connectDB from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const __dirname = path.resolve();
const countriesPath = path.join(__dirname, 'data', 'countries.json');
const statesPath = path.join(__dirname, 'data', 'states.json');
const citiesPath = path.join(__dirname, 'data', 'cities.json');

const importData = async () => {
    await connectDB();

    try {
        console.log('Importing Countries...');
        const countriesData = JSON.parse(await fs.readFile(countriesPath, 'utf-8'));
        const countriesMap = {};

        for (const cData of countriesData) {
            try {
                const country = new Country({
                    name: cData.name,
                    iso2: cData.iso2,
                    iso3: cData.iso3,
                    phone_code: cData.phone_code,
                });
                await country.save();
                countriesMap[cData.id] = country._id;
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) {
                    process.stdout.write('D');
                } else {
                    console.error(`Error importing country ${cData.name}:`, err.message);
                }
            }
        }
        console.log('\nCountries Imported.');

        console.log('Importing States...');
        const statesData = JSON.parse(await fs.readFile(statesPath, 'utf-8'));
        const statesMap = {};

        for (const sData of statesData) {
            if (!countriesMap[sData.country_id]) {
                continue;
            }
            try {
                const state = new State({
                    name: sData.name,
                    country: countriesMap[sData.country_id],
                    state_code: sData.state_code,
                });
                await state.save();
                statesMap[sData.id] = state._id;
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) {
                    process.stdout.write('D');
                } else {
                    console.error(`Error importing state ${sData.name}:`, err.message);
                }
            }
        }
        console.log('\nStates Imported.');

        console.log('Importing Cities...');
        const citiesData = JSON.parse(await fs.readFile(citiesPath, 'utf-8'));

        for (const cData of citiesData) {
            if (!statesMap[cData.state_id]) {
                continue;
            }
            try {
                const city = new City({
                    name: cData.name,
                    state: statesMap[cData.state_id],
                    country: countriesMap[cData.country_id],
                });
                await city.save();
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) {
                    process.stdout.write('D');
                } else {
                    console.error(`Error importing city ${cData.name}:`, err.message);
                }
            }
        }
        console.log('\nCities Imported. Data import complete!');

    } catch (error) {
        console.error('Error during data import:', error);
    } finally {
        mongoose.connection.close();
    }
};

importData();