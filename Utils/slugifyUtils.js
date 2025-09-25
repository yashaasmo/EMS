// // // utils/slugifyUtils.js (create this new file)
// // import slugify from 'slugify';

// // /**
// //  * Generates a URL-friendly slug from a given text.
// //  * @param {string} text The input text (e.g., news title).
// //  * @param {string} lang The language ('en' for English, 'hi' for Hindi).
// //  *                      For 'hi', it will generate a cleaned slug from Hindi characters,
// //  *                      not a transliterated English version unless a specific
// //  *                      transliteration logic is added.
// //  * @returns {string} The generated slug.
// //  */
// // export const generateSlug = (text, lang = 'en') => {
// //     if (!text) return '';

// //     // Options for slugify
// //     const options = {
// //         lower: true,      // Convert to lower case
// //         strict: true,     // Strip special characters except replaced ones
// //         locale: 'en',     // Language for character mapping (e.g., 'đ' to 'd')
// //         trim: true,       // Trim leading/trailing hyphens
// //     };

// //     // For Hindi titles, if you intend to store a slug that keeps Devanagari characters
// //     // but cleans them for URL (less common for English-facing URLs),
// //     // you might need different regex or a library that handles Unicode slugs better.
// //     // However, for the context of "engali ma canvwwer ho ka", we primarily focus on English slugs.
// //     // If title_hi is meant to become an English slug, it implies transliteration, which `slugify` alone doesn't do perfectly for Hindi.

// //     // Given `title_en` exists, `slug_en` should be generated from it.
// //     // If `title_hi` needs an *English* slug, it implies transliteration.
// //     // For now, `slug_en` from `title_en`. `slug_hi` will just be a cleaned version of `title_hi` (retaining Devanagari for internal use, if any).

// //     // Example of converting "दिन कर्फ्यू, सुशीला कार्की अंतरिम PM बनेंगी:सरकार के लिए आर्मी और Gen-Z में बातचीत फिर शुरू, अब तक 31 मौतें, 1000 घायल"
// //     // to an English slug would require a dedicated transliteration.
// //     // A manual human-interpreted slug for that Hindi title might be:
// //     // "day-curfew-sushila-karki-interim-pm-army-gen-z-talks-31-dead-1000-injured" (shortened for URL practicality)

// //     // For this implementation, `slug_en` will be from `title_en`.
// //     return slugify(text, options);
// // };

// // utils/slugifyUtils.js
// import slugify from "slugify";

// export const generateSlug = (text, lang = "en") => {
//   if (!text) return "";

//   const options = {
//     lower: true,
//     strict: true,
//     trim: true,
//   };

//   if (lang === "en") {
//     return slugify(text, { ...options, locale: "en" });
//   }

//   if (lang === "hi") {
//     // ✅ Keep Hindi characters (Unicode-safe slug)
//     return text
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-") // spaces → hyphen
//       .replace(/[.,/#!$%^&*;:{}=_`~()]/g, "") // remove punctuation
//       .replace(/-+/g, "-"); // collapse multiple hyphens
//   }

//   return slugify(text, options);
// };

// utils/slugifyUtils.js
export const generateSlug = (text) => {
  if (!text) return "";

  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-") // space → hyphen
    .replace(/[.,/#!$%^&*;:{}=_`~()'"?<>|[\]\\]/g, "") // punctuation remove
    .replace(/-+/g, "-"); // multiple hyphen → single
};
