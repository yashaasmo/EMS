import fs from 'fs/promises';
import path from 'path';
import { ApiError } from '../Utils/apiError';
import { STATUS_CODES } from '../Utils/status.codes.messages';

const __dirname = path.resolve();
const staticTagsDir = path.join(__dirname, 'data', 'static_tags');
let cachedBaseCategories = null;
let cachedBaseSubCategories = null;

const loadStaticTagData = async (fileName) => {
  try {
    const filePath = path.join(staticTagsDir, fileName);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading static tag data from ${fileName}:`, error);
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, `Failed to load static tag data from ${fileName}. Please ensure 'data/static_tags' folder and files are present and correct.`);
  }
};

export const getStaticBaseCategories = async (req, res, next) => {
  try {
    if (!cachedBaseCategories) {
      cachedBaseCategories = await loadStaticTagData('base_categories.json');
    }
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: cachedBaseCategories.length,
      data: cachedBaseCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaticBaseSubCategories = async (req, res, next) => {
  try {
    const { categoryName } = req.query;

    if (!cachedBaseSubCategories) {
      cachedBaseSubCategories = await loadStaticTagData('base_subcategories.json');
    }

    let filteredSubCategories = cachedBaseSubCategories;

    if (categoryName) {
      filteredSubCategories = filteredSubCategories.filter(
        sub => sub.category && sub.category.toLowerCase() === categoryName.toLowerCase()
      );
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: filteredSubCategories.length,
      data: filteredSubCategories,
    });
  } catch (error) {
    next(error);
  }
};