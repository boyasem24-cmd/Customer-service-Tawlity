import { datatype, random } from "faker/locale/en_US";

/** Fictional sample data with a Kuwaiti flavour, used by the demo generator. */

export const firstNamesMale = [
  "Abdullah",
  "Ahmad",
  "Ali",
  "Bader",
  "Fahad",
  "Faisal",
  "Hamad",
  "Hussain",
  "Khaled",
  "Mishal",
  "Mohammad",
  "Nasser",
  "Omar",
  "Saad",
  "Salem",
  "Talal",
  "Yousef",
  "Ziad",
  "Rami",
  "Karim",
  "Marco",
  "Ravi",
  "Hiro",
];

export const firstNamesFemale = [
  "Aisha",
  "Dana",
  "Fatma",
  "Hessa",
  "Latifa",
  "Lulwa",
  "Mariam",
  "Noura",
  "Rawan",
  "Sara",
  "Shaikha",
  "Yasmin",
  "Zainab",
  "Lina",
  "Rania",
  "Priya",
  "Sofia",
];

export const lastNames = [
  "Al-Sabah",
  "Al-Mutairi",
  "Al-Azmi",
  "Al-Enezi",
  "Al-Rashidi",
  "Al-Ajmi",
  "Al-Shammari",
  "Al-Kandari",
  "Al-Awadhi",
  "Al-Hajri",
  "Al-Otaibi",
  "Al-Failakawi",
  "Al-Kharafi",
  "Al-Ghanim",
  "Behbehani",
  "Dashti",
  "Haddad",
  "Khoury",
  "Nair",
  "Rossi",
  "Tanaka",
];

export const areasByGovernorate: Record<string, string[]> = {
  capital: [
    "Kuwait City",
    "Sharq",
    "Dasman",
    "Shuwaikh",
    "Kaifan",
    "Shamiya",
    "Daiya",
  ],
  hawalli: ["Salmiya", "Hawalli", "Jabriya", "Shaab", "Bidaa", "Salwa"],
  farwaniya: ["Farwaniya", "Khaitan", "Ardiya", "Rai"],
  ahmadi: ["Fintas", "Mangaf", "Fahaheel", "Abu Halifa", "Khairan"],
  jahra: ["Jahra", "Saad Al Abdullah", "Qasr"],
  mubarak_al_kabeer: ["Qurain", "Adan", "Sabah Al Salem", "Messila"],
};

export const holdingGroups = [
  { name: "Gulf Table Group", brands: 4 },
  { name: "Dar Al Diyafa Holding", brands: 3 },
  { name: "Seef Hospitality Co.", brands: 3 },
];

/** [name, cuisines, price range] */
export const restaurantNames: [string, string[], string][] = [
  ["Bait Al Najdi", ["kuwaiti", "arabic"], "KDD"],
  ["Mais Alghanim Kitchen", ["kuwaiti"], "KDD"],
  ["Beirut Corner", ["lebanese", "arabic"], "KD"],
  ["Zaatar & Zeit House", ["lebanese"], "KD"],
  ["Trattoria Salmiya", ["italian"], "KDD"],
  ["Pasta Nonna", ["italian"], "KDD"],
  ["Sakura Sharq", ["japanese"], "KDDD"],
  ["Kumo Sushi Bar", ["japanese", "seafood"], "KDDD"],
  ["Masala Darbar", ["indian"], "KD"],
  ["Tandoor Lane", ["indian"], "KD"],
  ["Smash Burger Co.", ["american"], "KD"],
  ["Liberty Diner", ["american"], "KD"],
  ["Qahwa Lounge", ["cafe"], "KD"],
  ["Bloom Coffee Roasters", ["cafe", "bakery_desserts"], "KD"],
  ["Kunafa & More", ["bakery_desserts", "arabic"], "KD"],
  ["Sugar Pearl Patisserie", ["bakery_desserts"], "KDD"],
  ["Al Bahar Fish Market", ["seafood", "kuwaiti"], "KDD"],
  ["The Pearl Diver", ["seafood"], "KDDD"],
  ["Prime Cut Steakhouse", ["steakhouse"], "KDDD"],
  ["Ember Grill House", ["steakhouse", "american"], "KDDD"],
  ["Shawarma Station", ["arabic"], "KD"],
  ["Mandi Palace", ["arabic"], "KD"],
  ["Dasman Terrace", ["arabic", "lebanese"], "KDD"],
  ["Ramen Republic", ["japanese"], "KDD"],
  ["Spice Route", ["indian", "other"], "KDD"],
  ["Gahwa & Dates", ["cafe", "kuwaiti"], "KD"],
  ["Olive Tree Bistro", ["lebanese", "italian"], "KDD"],
  ["Wood Fired Pizza Lab", ["italian"], "KD"],
  ["Fintas Fish Grill", ["seafood"], "KD"],
  ["Jahra Family Kitchen", ["kuwaiti", "arabic"], "KD"],
  ["Burger Shack 965", ["american"], "KD"],
  ["Matcha Mornings", ["cafe", "japanese"], "KD"],
  ["Saffron Table", ["indian", "arabic"], "KDD"],
  ["Lusail Grill", ["arabic", "steakhouse"], "KDD"],
  ["Crust Bakery", ["bakery_desserts"], "KD"],
  ["Nikkei 965", ["japanese", "other"], "KDDD"],
];

export const randomKuwaitMobile = () => {
  const first = random.arrayElement(["5", "6", "9"]);
  const rest = String(datatype.number({ min: 1000000, max: 9999999 }));
  const digits = `${first}${rest}`;
  return `+965 ${digits.slice(0, 4)} ${digits.slice(4)}`;
};

export const randomKuwaitLandline = () => {
  const rest = String(datatype.number({ min: 1000000, max: 9999999 }));
  const digits = `2${rest}`;
  return `+965 ${digits.slice(0, 4)} ${digits.slice(4)}`;
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
