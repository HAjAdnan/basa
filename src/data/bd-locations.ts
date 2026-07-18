export interface Upazila {
  nameEn: string;
  nameBn: string;
}

export interface District {
  nameEn: string;
  nameBn: string;
  upazilas: Upazila[];
}

export interface Division {
  nameEn: string;
  nameBn: string;
  districts: { [key: string]: District };
}

export const bdLocations: { [key: string]: Division } = {
  dhaka: {
    nameEn: "Dhaka",
    nameBn: "ঢাকা",
    districts: {
      dhaka: {
        nameEn: "Dhaka",
        nameBn: "ঢাকা",
        upazilas: [
          { nameEn: "Dhamrai", nameBn: "ধামরাই" },
          { nameEn: "Dohar", nameBn: "দোহার" },
          { nameEn: "Keraniganj", nameBn: "কেরানীগঞ্জ" },
          { nameEn: "Nawabganj", nameBn: "নবাবগঞ্জ" },
          { nameEn: "Savar", nameBn: "সাভার" },
          { nameEn: "Mirpur", nameBn: "মিরপুর" },
          { nameEn: "Uttara", nameBn: "উত্তরা" },
          { nameEn: "Gulshan", nameBn: "গুলশান" },
          { nameEn: "Dhanmondi", nameBn: "ধানমণ্ডি" },
          { nameEn: "Mohammadpur", nameBn: "মোহাম্মদপুর" },
          { nameEn: "Badda", nameBn: "বাড্ডা" },
          { nameEn: "Khilgaon", nameBn: "খিলগাঁও" }
        ]
      },
      gazipur: {
        nameEn: "Gazipur",
        nameBn: "গাজীপুর",
        upazilas: [
          { nameEn: "Gazipur Sadar", nameBn: "গাজীপুর সদর" },
          { nameEn: "Kaliakair", nameBn: "কালিয়াকৈর" },
          { nameEn: "Kaliganj", nameBn: "কালীগঞ্জ" },
          { nameEn: "Kapasia", nameBn: "কাপাসিয়া" },
          { nameEn: "Sreepur", nameBn: "শ্রীপুর" }
        ]
      },
      narayanganj: {
        nameEn: "Narayanganj",
        nameBn: "নারায়ণগঞ্জ",
        upazilas: [
          { nameEn: "Araihazar", nameBn: "আড়াইহাজার" },
          { nameEn: "Bandar", nameBn: "বন্দর" },
          { nameEn: "Narayanganj Sadar", nameBn: "নারায়ণগঞ্জ সদর" },
          { nameEn: "Rupganj", nameBn: "রূপগঞ্জ" },
          { nameEn: "Sonargaon", nameBn: "সোনারগাঁও" }
        ]
      },
      tangail: {
        nameEn: "Tangail",
        nameBn: "টাঙ্গাইল",
        upazilas: [
          { nameEn: "Tangail Sadar", nameBn: "টাঙ্গাইল সদর" },
          { nameEn: "Mirzapur", nameBn: "মির্জাপুর" },
          { nameEn: "Kalihati", nameBn: "কালিহাতী" },
          { nameEn: "Ghatail", nameBn: "ঘাটাইল" },
          { nameEn: "Sakhipur", nameBn: "সখিপুর" },
          { nameEn: "Madhupur", nameBn: "মধুপুর" }
        ]
      }
    }
  },
  chattogram: {
    nameEn: "Chattogram",
    nameBn: "চট্টগ্রাম",
    districts: {
      chattogram: {
        nameEn: "Chattogram",
        nameBn: "চট্টগ্রাম",
        upazilas: [
          { nameEn: "Anwara", nameBn: "আনোয়ারা" },
          { nameEn: "Banshkhali", nameBn: "বাশঁখালী" },
          { nameEn: "Boalkhali", nameBn: "বোয়ালখালী" },
          { nameEn: "Hathazari", nameBn: "হাটহাজারী" },
          { nameEn: "Lohagara", nameBn: "লোহাগাড়া" },
          { nameEn: "Mirsharai", nameBn: "মীরসরাই" },
          { nameEn: "Patiya", nameBn: "পটিয়া" },
          { nameEn: "Rangunia", nameBn: "রাঙ্গুনিয়া" },
          { nameEn: "Raozan", nameBn: "রাউজান" },
          { nameEn: "Sandwip", nameBn: "সন্দ্বীপ" },
          { nameEn: "Satkania", nameBn: "সাতকানিয়া" },
          { nameEn: "Sithakunda", nameBn: "সীতাকুণ্ড" }
        ]
      },
      coxsbazar: {
        nameEn: "Cox's Bazar",
        nameBn: "কক্সবাজার",
        upazilas: [
          { nameEn: "Cox's Bazar Sadar", nameBn: "কক্সবাজার সদর" },
          { nameEn: "Chakaria", nameBn: "চকরিয়া" },
          { nameEn: "Maheshkhali", nameBn: "মহেশখালী" },
          { nameEn: "Teknaf", nameBn: "টেকনাফ" },
          { nameEn: "Ukhia", nameBn: "উখিয়া" },
          { nameEn: "Ramu", nameBn: "রামু" },
          { nameEn: "Pekua", nameBn: "পেকুয়া" }
        ]
      },
      cumilla: {
        nameEn: "Cumilla",
        nameBn: "কুমিল্লা",
        upazilas: [
          { nameEn: "Cumilla Sadar", nameBn: "কুমিল্লা সদর" },
          { nameEn: "Barura", nameBn: "বড়ুড়া" },
          { nameEn: "Brahmanpara", nameBn: "ব্রাহ্মণপাড়া" },
          { nameEn: "Burichang", nameBn: "বুড়িচং" },
          { nameEn: "Chandina", nameBn: "চান্দিনা" },
          { nameEn: "Chauddagram", nameBn: "চৌদ্দগ্রাম" },
          { nameEn: "Debidwar", nameBn: "দেবিদ্বার" },
          { nameEn: "Laksham", nameBn: "লাকসাম" }
        ]
      }
    }
  },
  sylhet: {
    nameEn: "Sylhet",
    nameBn: "সিলেট",
    districts: {
      sylhet: {
        nameEn: "Sylhet",
        nameBn: "সিলেট",
        upazilas: [
          { nameEn: "Sylhet Sadar", nameBn: "সিলেট সদর" },
          { nameEn: "Balaganj", nameBn: "বালাগঞ্জ" },
          { nameEn: "Beanibazar", nameBn: "বিয়ানীবাজার" },
          { nameEn: "Bishwanath", nameBn: "বিশ্বনাথ" },
          { nameEn: "Fenchuganj", nameBn: "ফেঞ্চুগঞ্জ" },
          { nameEn: "Golapganj", nameBn: "গোলাপগঞ্জ" },
          { nameEn: "Gowainghat", nameBn: "গোয়াইনঘাট" },
          { nameEn: "Kanaighat", nameBn: "কানাইঘাট" }
        ]
      },
      moulvibazar: {
        nameEn: "Moulvibazar",
        nameBn: "মৌলভীবাজার",
        upazilas: [
          { nameEn: "Moulvibazar Sadar", nameBn: "মৌলভীবাজার সদর" },
          { nameEn: "Barlekha", nameBn: "বড়লেখা" },
          { nameEn: "Kamalganj", nameBn: "কমলগঞ্জ" },
          { nameEn: "Kulaura", nameBn: "কুলাউড়া" },
          { nameEn: "Rajnagar", nameBn: "রাজনগর" },
          { nameEn: "Sreemangal", nameBn: "শ্রীমঙ্গল" }
        ]
      }
    }
  },
  rajshahi: {
    nameEn: "Rajshahi",
    nameBn: "রাজশাহী",
    districts: {
      rajshahi: {
        nameEn: "Rajshahi",
        nameBn: "রাজশাহী",
        upazilas: [
          { nameEn: "Bagha", nameBn: "বাঘা" },
          { nameEn: "Bagmara", nameBn: "বাগমারা" },
          { nameEn: "Charghat", nameBn: "চারঘাট" },
          { nameEn: "Durgapur", nameBn: "দুর্গাপুর" },
          { nameEn: "Godagari", nameBn: "গোদাগাড়ী" },
          { nameEn: "Mohanpur", nameBn: "মোহনপুর" },
          { nameEn: "Paba", nameBn: "পবা" },
          { nameEn: "Puthia", nameBn: "পুঠিয়া" },
          { nameEn: "Tanore", nameBn: "তানোর" }
        ]
      },
      bogra: {
        nameEn: "Bogra",
        nameBn: "বগুড়া",
        upazilas: [
          { nameEn: "Bogra Sadar", nameBn: "বগুড়া সদর" },
          { nameEn: "Adamdighi", nameBn: "আদমদিঘী" },
          { nameEn: "Dhunat", nameBn: "ধুনট" },
          { nameEn: "Dupchanchia", nameBn: "দুপচাঁচিয়া" },
          { nameEn: "Gabtali", nameBn: "গাবতলী" },
          { nameEn: "Kahaloo", nameBn: "কাহালু" },
          { nameEn: "Nandigram", nameBn: "নন্দীগ্রাম" },
          { nameEn: "Sherpur", nameBn: "শেরপুর" },
          { nameEn: "Shibganj", nameBn: "শিবগঞ্জ" }
        ]
      }
    }
  },
  khulna: {
    nameEn: "Khulna",
    nameBn: "খুলনা",
    districts: {
      khulna: {
        nameEn: "Khulna",
        nameBn: "খুলনা",
        upazilas: [
          { nameEn: "Batiaghata", nameBn: "বটিয়াঘাটা" },
          { nameEn: "Dacope", nameBn: "দাকোপ" },
          { nameEn: "Dumuria", nameBn: "ডুমুরিয়া" },
          { nameEn: "Koyra", nameBn: "কয়রা" },
          { nameEn: "Paikgachha", nameBn: "পাইকগাছা" },
          { nameEn: "Phultala", nameBn: "ফুলতলা" },
          { nameEn: "Rupsha", nameBn: "রূপসা" },
          { nameEn: "Terokhada", nameBn: "তেরখাদা" }
        ]
      },
      jashore: {
        nameEn: "Jashore",
        nameBn: "যশোর",
        upazilas: [
          { nameEn: "Jashore Sadar", nameBn: "যশোর সদর" },
          { nameEn: "Abhaynagar", nameBn: "অভয়নগর" },
          { nameEn: "Bagherpara", nameBn: "বাঘেরপাড়া" },
          { nameEn: "Chougachha", nameBn: "চৌগাছা" },
          { nameEn: "Jhikargachha", nameBn: "ঝিকরগাছা" },
          { nameEn: "Keshabpur", nameBn: "কেশবপুর" },
          { nameEn: "Manirampur", nameBn: "মণিরামপুর" },
          { nameEn: "Sharsha", nameBn: "শার্শা" }
        ]
      }
    }
  },
  barishal: {
    nameEn: "Barishal",
    nameBn: "বরিশাল",
    districts: {
      barishal: {
        nameEn: "Barishal",
        nameBn: "বরিশাল",
        upazilas: [
          { nameEn: "Barishal Sadar", nameBn: "বরিশাল সদর" },
          { nameEn: "Agailjhara", nameBn: "আগৈলঝারা" },
          { nameEn: "Babuganj", nameBn: "বাবুগঞ্জ" },
          { nameEn: "Bakerganj", nameBn: "বাকেরগঞ্জ" },
          { nameEn: "Banaripara", nameBn: "বানারীপাড়া" },
          { nameEn: "Gournadi", nameBn: "গৌরনদী" },
          { nameEn: "Hizla", nameBn: "হিজলা" },
          { nameEn: "Mehendiganj", nameBn: "মেহেন্দিগঞ্জ" },
          { nameEn: "Muladi", nameBn: "মুলাদী" },
          { nameEn: "Wazirpur", nameBn: "উজিরপুর" }
        ]
      }
    }
  },
  rangpur: {
    nameEn: "Rangpur",
    nameBn: "রংপুর",
    districts: {
      rangpur: {
        nameEn: "Rangpur",
        nameBn: "রংপুর",
        upazilas: [
          { nameEn: "Rangpur Sadar", nameBn: "রংপুর সদর" },
          { nameEn: "Badarganj", nameBn: "বদরগঞ্জ" },
          { nameEn: "Gangachhara", nameBn: "গঙ্গাচড়া" },
          { nameEn: "Kaunia", nameBn: "কাউনিয়া" },
          { nameEn: "Mithapukur", nameBn: "মিঠাপুকুর" },
          { nameEn: "Pirgachha", nameBn: "পীরগাছা" },
          { nameEn: "Pirganj", nameBn: "পীরগঞ্জ" },
          { nameEn: "Taraganj", nameBn: "তারাগঞ্জ" }
        ]
      }
    }
  },
  mymensingh: {
    nameEn: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    districts: {
      mymensingh: {
        nameEn: "Mymensingh",
        nameBn: "ময়মনসিংহ",
        upazilas: [
          { nameEn: "Mymensingh Sadar", nameBn: "ময়মনসিংহ সদর" },
          { nameEn: "Bhaluka", nameBn: "ভালুকা" },
          { nameEn: "Gaffargaon", nameBn: "গফরগাঁও" },
          { nameEn: "Gouripur", nameBn: "গৌরীপুর" },
          { nameEn: "Haluaghat", nameBn: "হালুয়াঘাট" },
          { nameEn: "Ishwarganj", nameBn: "ঈশ্বরগঞ্জ" },
          { nameEn: "Muktagachha", nameBn: "মুক্তাগাছা" },
          { nameEn: "Nandail", nameBn: "নান্দাইল" },
          { nameEn: "Phulpur", nameBn: "ফুলপুর" },
          { nameEn: "Trishal", nameBn: "ত্রিশাল" }
        ]
      }
    }
  }
};
