// Models/ad.model.js
import mongoose from 'mongoose';

const AdsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['google', 'custom'], // विज्ञापन का प्रकार: गूगल एडसेंस या कस्टम इमेज/वीडियो विज्ञापन
    required: true
  },
  position: {
    type: String,
    required: true,
    enum: ['top', 'bottom', 'sidebar', 'popup', 'inline'] // विज्ञापन प्लेसमेंट की स्थिति
  },
  link: {
    type: String,
    required: function () {
      return this.type === 'google'; // केवल तभी आवश्यक जब विज्ञापन का प्रकार 'गूगल' हो (एडसेंस स्क्रिप्ट URL के लिए)
    }
  },
  title: {
    type: String,
    required: function () {
      return this.type === 'custom'; // केवल तभी आवश्यक जब विज्ञापन का प्रकार 'कस्टम' हो
    }
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', null], // कस्टम विज्ञापनों के लिए मीडिया का प्रकार
    default: null
  },
  mediaUrl: {
    type: String,
    default: null // कस्टम विज्ञापनों के लिए इमेज/वीडियो का URL, स्पेसेस पर संग्रहीत
  },
  isActive: {
    type: Boolean,
    default: true // क्या विज्ञापन वर्तमान में सक्रिय है या नहीं
  }
}, {
  timestamps: true // स्वचालित रूप से createdAt और updatedAt फ़ील्ड जोड़ता है
});

export default mongoose.model('Ads', AdsSchema);