import mongoose from 'mongoose';
import { Category, SubCategory } from '../Models/lookupData.model.js';
import connectDB from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';

const __dirname = path.resolve();
const rawDataDir = path.join(__dirname, 'data', 'raw');

const importData = async () => {
    await connectDB();

    try {
        console.log('--- Starting Base Category/SubCategory Import to MongoDB ---');

        console.log('Cleaning up old Category and SubCategory data in MongoDB...');
        await Category.deleteMany({});
        await SubCategory.deleteMany({});
        console.log('Old Category and SubCategory data cleared.');

        console.log('Importing Categories...');
        const categoriesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'categories_raw.json'), 'utf-8'));
        const categoryMap = {};

        for (const catData of categoriesData) {
            if (catData.key) {
                process.stdout.write('H');
                continue;
            }
            try {
                const category = new Category({
                    name: catData.name,
                    slug: catData.slug,
                    description: catData.description,
                });
                await category.save();
                categoryMap[catData.id] = category._id;
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) { process.stdout.write('D'); }
                else { console.error(`Error importing category ${catData.name}:`, err.message); }
            }
        }
        console.log('\n✅ Categories Imported.');

        console.log('Importing SubCategories...');
        const subCategoriesData = JSON.parse(await fs.readFile(path.join(rawDataDir, 'subcategories_raw.json'), 'utf-8'));

        for (const subCatData of subCategoriesData) {
            if (subCatData.key) {
                process.stdout.write('H');
                continue;
            }

            const parentCategoryId = categoryMap[subCatData.category];
            if (!parentCategoryId) {
                console.warn(`\nWarning: Skipping subCategory ${subCatData.name} - Parent category '${subCatData.category}' not found or imported.`);
                continue;
            }

            try {
                const subCategory = new SubCategory({
                    name: subCatData.name,
                    slug: subCatData.slug,
                    category: parentCategoryId,
                    description: subCatData.description || null,
                });
                await subCategory.save();
                process.stdout.write('.');
            } catch (err) {
                if (err.code === 11000) { process.stdout.write('D'); }
                else { console.error(`Error importing subCategory ${subCatData.name}:`, err.message); }
            }
        }
        console.log('\n✅ SubCategories Imported. Data import complete!');

    } catch (error) {
        console.error('Error during base tags import:', error);
        console.error("Please ensure 'categories_raw.json' and 'subcategories_raw.json' are in 'data/raw' and are valid JSON.");
    } finally {
        mongoose.connection.close();
    }
};

importData();