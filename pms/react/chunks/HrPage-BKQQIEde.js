import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { a as o, n as s, o as c, r as l, t as u } from "./dialog-DtgtvZ4Q.js";
import { i as d, n as f, r as p, t as m } from "./tabs-IQDmk0rj.js";
import { t as h } from "./button-BGWa3SLr.js";
import { t as g } from "./card-B9_OGomP.js";
import { t as _ } from "./input-DSBk_UeU.js";
import { t as v } from "./utils-b7UP9Cmo.js";
import { t as y } from "./ConfirmDialog-GfriOiUy.js";
import { t as b } from "./badge-EB7Muw37.js";
import { t as x } from "./textarea-BxHERF6b.js";
// src/pages/hr/library.ts
var S = /* @__PURE__ */ t(i(), 1), C = [
	[
		"hk",
		"🛏️ Housekeeping",
		"হাউসকিপিং"
	],
	[
		"pa",
		"🧹 Public areas",
		"পাবলিক এলাকা"
	],
	[
		"ln",
		"🧺 Linen & laundry",
		"লিনেন ও লন্ড্রি"
	],
	[
		"fb",
		"🍽️ Food & beverage (Mawaid)",
		"খাবার ও পানীয়"
	],
	[
		"ks",
		"🍳 Kitchen & stewarding",
		"রান্নাঘর"
	],
	[
		"bd",
		"🛎️ Bell desk & lobby",
		"বেল ডেস্ক"
	],
	[
		"lu",
		"📦 Loading & unloading",
		"মাল ওঠানো-নামানো"
	],
	[
		"st",
		"🗄️ Stores & supplies",
		"স্টোর"
	],
	[
		"mt",
		"🔧 Maintenance",
		"রক্ষণাবেক্ষণ"
	],
	[
		"sf",
		"🛡️ Security & safety",
		"নিরাপত্তা"
	],
	[
		"bo",
		"🕳️ Back of house (unseen jobs)",
		"পেছনের কাজ"
	],
	[
		"tr",
		"🚌 Transport support",
		"যানবাহন সহায়তা"
	],
	[
		"pr",
		"🕌 Prayer & wudu areas",
		"নামাজ ও ওজুর স্থান"
	]
], w = (e, t, n, r, i) => ({
	dept: e,
	title: t,
	bn: n,
	skills: r,
	duties: i.split("|").map((e) => e.trim()).filter(Boolean)
}), T = [
	w("hk", "Room attendant", "রুম অ্যাটেনডেন্ট", "Bed making, bathroom cleaning, chemical safety", "Collect the room list and keys from the supervisor|Knock, say \"Housekeeping\", wait, then enter|Open curtains and windows to air the room|Strip used linen, count it, bag it|Make beds tight with fresh linen (corners folded)|Empty and wash bins, put new liners|Dust all surfaces top to bottom|Clean mirror and glass streak-free|Clean and disinfect toilet, basin, shower, floor|Refill soap, tissue, shampoo, water bottles|Vacuum / mop the floor, last from the far corner to the door|Check lights, AC, TV, taps — report anything broken|Report lost & found items at once|Mark the room done on the room list"),
	w("hk", "Floor supervisor", "ফ্লোর সুপারভাইজার", "Inspection, team handling, reporting", "Give out room lists, keys and trolleys at shift start|Inspect every cleaned room against the checklist|Send back rooms that fail, with the reason|Check corridors, service rooms and trolleys|Report maintenance faults the same hour|Collect lost & found and register it in the PMS|Count linen in and out with the linen room|Hand over open rooms and problems to the next shift"),
	w("hk", "Turndown / night housekeeper", "রাতের হাউসকিপার", "Quiet work, guest requests", "Answer guest requests for towels, blankets, water|Refill corridor water and tissue stations|Clean lobby toilets every 2 hours|Clear room-service trays from corridors|Report noise, smells or leaks"),
	w("hk", "Deep-cleaning team", "গভীর পরিষ্কার দল", "Machines, chemicals, working at height", "Wash carpets and mattresses by schedule|Descale showers and taps|Clean behind and under beds and furniture|Wash curtains and blackout linings|Clean AC grills and vents|Polish wood and metal fittings"),
	w("pa", "Public area cleaner", "পাবলিক এলাকা ক্লিনার", "Floor care, toilet hygiene", "Mop the lobby and entrance every 2 hours|Clean public toilets and fill the checklist on the door|Clean lift cars, buttons and mirrors|Wipe handrails, door handles and push plates|Empty lobby bins and ashtrays|Clean the glass doors and windows|Put up wet-floor signs while mopping"),
	w("pa", "Lift & stairwell cleaner", "লিফট ও সিঁড়ি ক্লিনার", "Floor care", "Sweep and mop every staircase top to bottom|Wipe handrails|Clean lift floors, walls and buttons|Check stair lights and emergency signs|Clear anything blocking fire exits"),
	w("ln", "Linen room attendant", "লিনেন রুম অ্যাটেনডেন্ট", "Counting, stock, records", "Issue clean linen to floors against the list|Count soiled linen in from each floor|Separate torn and stained pieces|Send linen to laundry with a count sheet|Count clean linen back from laundry|Keep par stock (3 sets per bed)|Report shortages to the supervisor"),
	w("ln", "Laundry attendant", "লন্ড্রি অ্যাটেনডেন্ট", "Machines, stain removal, folding", "Sort by colour and fabric|Pre-treat stains|Load machines to the right weight|Dry and fold to the hotel standard|Iron guest clothes carefully|Clean lint filters after every load|Log every guest bag in and out"),
	w("fb", "Mawaid server", "মাওয়াইদ সার্ভার", "Serving, hygiene, polite manner", "Wash hands, wear cap and gloves|Lay the safra / thaal places|Bring food out in order|Refill water and bread|Clear empty dishes promptly|Wipe and sweep the hall after each meal|Report numbers short or over to the supervisor"),
	w("fb", "Buffet / thaal runner", "থাল রানার", "Speed, hygiene", "Carry thaals from kitchen to hall|Keep hot food covered|Bring back empty thaals and dishes|Keep the pass clean"),
	w("fb", "Tea & coffee attendant", "চা-কফি অ্যাটেনডেন্ট", "Hot drinks, hygiene", "Prepare tea and coffee to timetable|Keep the tea counter clean|Refill cups, sugar, milk|Wash flasks at the end of the day"),
	w("ks", "Kitchen helper", "রান্নাঘর সহকারী", "Cutting, cleaning, hygiene", "Wash, peel and cut vegetables|Clean rice and lentils|Carry stores to the kitchen|Keep work tables clean|Take out kitchen waste|Clean the floor at end of shift"),
	w("ks", "Steward / dishwasher", "ডিশওয়াশার", "Dishwashing, chemicals", "Scrape and soak dishes|Wash, rinse, sanitise, air-dry|Wash pots and pans|Stack clean dishes by type|Clean the dishwashing area and drains|Change dish-machine water by the schedule"),
	w("ks", "Store keeper (food)", "খাদ্য স্টোরকিপার", "Counting, FIFO, records", "Receive deliveries and check weight and quality|Store first-in-first-out|Check expiry dates daily|Log fridge and freezer temperatures|Issue stock to the kitchen against requests|Count stock weekly"),
	w("bd", "Bellboy / porter", "বেলবয় / পোর্টার", "Lifting safely, politeness", "Greet arriving groups at the door|Tag every bag with the room number|Take luggage up to rooms|Bring luggage down on departure, in time for the bus|Keep trolleys clean and ready|Help elderly guests to the lift"),
	w("bd", "Doorman", "ডোরম্যান", "Politeness, watching the entrance", "Open doors and greet guests|Keep the entrance clear of bags and trolleys|Call porters when a bus arrives|Stop strangers and ask whom they are visiting"),
	w("bd", "Luggage room attendant", "লাগেজ রুম অ্যাটেনডেন্ট", "Records, careful handling", "Take stored luggage with a numbered tag|Give the guest the matching ticket|Keep the room locked and tidy|Hand back only against the ticket|Count bags at shift change"),
	w("lu", "Bus luggage loader", "বাস লাগেজ লোডার", "Lifting safely, counting", "Line up luggage by group before the bus|Count bags against the group list|Load heavy bags first, fragile on top|Close and check the luggage door|Unload on arrival and count again|Report missing or damaged bags"),
	w("lu", "Delivery loader", "ডেলিভারি লোডার", "Lifting, trolley use", "Unload supplier trucks at the back gate|Check the count against the delivery note|Move goods to the right store at once|Keep the loading bay clear and swept"),
	w("st", "General store keeper", "স্টোরকিপার", "Stock control, records", "Issue amenities, chemicals and supplies against requests|Keep a bin card for every item|Reorder at minimum level|Count stock weekly|Keep chemicals apart from food"),
	w("mt", "Maintenance technician", "মেইনটেন্যান্স টেকনিশিয়ান", "Electrical, plumbing basics", "Attend fault tickets in order of urgency|Fix taps, flush, drains, bulbs, sockets|Check AC units and clean filters|Report big faults to the engineer|Close every ticket with what was done"),
	w("mt", "Plumber helper", "প্লাম্বার সহকারী", "Plumbing", "Unblock drains and toilets|Fix leaking taps and pipes|Check water heaters|Check water pressure on top floors"),
	w("mt", "AC technician helper", "এসি টেকনিশিয়ান সহকারী", "HVAC basics", "Clean AC filters by schedule|Check drain lines for leaks|Check room temperature complaints|Report noisy or warm units"),
	w("sf", "Security guard", "নিরাপত্তা প্রহরী", "Watching, reporting, politeness", "Check people and goods at the gate|Patrol all floors every 2 hours|Check fire exits are clear and closed|Lock and check service doors at night|Write every incident in the log|Hand over the log to the next shift"),
	w("sf", "Fire safety checker", "অগ্নি নিরাপত্তা পরিদর্শক", "Fire equipment", "Check extinguishers (pressure, seal, date)|Check hose reels and fire doors|Test emergency lights|Keep fire exits clear|Report anything blocked or broken"),
	w("bo", "Waste & garbage handler", "আবর্জনা ব্যবস্থাপক", "Hygiene, heavy lifting", "Collect garbage from every floor|Separate cardboard and plastic|Wash bins and the garbage room|Spray disinfectant and insecticide|Keep the garbage room door closed"),
	w("bo", "Water & tanks attendant", "পানির ট্যাংক অ্যাটেনডেন্ট", "Pumps, tanks", "Check tank levels morning and evening|Check pumps and pressure|Log water meter readings|Refill drinking-water dispensers|Report leaks at once"),
	w("bo", "Pest control coordinator", "কীটপতঙ্গ নিয়ন্ত্রণ", "Safe chemical use", "Check traps and bait stations weekly|Spray drains and garbage areas|Record every sighting with room and date|Call the pest company when needed"),
	w("tr", "Transport coordinator helper", "পরিবহন সহকারী", "Lists, counting people", "Read the bus list for the day|Call groups 30 minutes before the bus|Count people boarding against the list|Tell the desk who is missing|Help with luggage at the bus"),
	w("pr", "Prayer & wudu area attendant", "নামাজ ও ওজুখানা অ্যাটেনডেন্ট", "Cleaning, care", "Clean the wudu area before every namaz|Dry the floor, put mats down|Arrange prayer mats and musallas|Refill water, tissues, soap|Arrange shoe racks|Report leaks or broken taps")
], E = (e, t, n, r, i, a, o, s, c = "normal") => ({
	dept: e,
	title: t,
	bn: n,
	place: r,
	minutes: i,
	freq: a,
	photo: o,
	priority: c,
	steps: s.split("|").map((e) => e.trim()).filter(Boolean)
}), D = [
	E("hk", "Clean a check-out room", "চেকআউট রুম পরিষ্কার", "Rooms on the list", 35, "per room", !0, "Strip all linen and count it|Empty bins, take out rubbish|Dust top to bottom|Clean and disinfect the bathroom|Make beds with fresh linen|Refill amenities and water|Mop the floor|Check AC, lights, TV, taps|Photo of the finished room", "high"),
	E("hk", "Service an occupied room", "রুম সার্ভিস (অতিথি আছেন)", "Rooms on the list", 20, "daily", !1, "Knock and announce|Make beds (change linen if asked)|Empty bins|Clean the bathroom|Refill tissue, soap, water|Do not move the guests' belongings"),
	E("hk", "Prepare rooms for an arriving group", "আগত গ্রুপের রুম প্রস্তুত", "Rooms for today's check-ins", 15, "per arrival", !0, "Check the room is clean and smells fresh|Set AC to 22°C 30 minutes before|Put welcome water and dates|Check towels: 1 big + 1 small per guest|Check the key card works", "high"),
	E("hk", "Turn down rooms on request", "টার্নডাউন সার্ভিস", "Rooms that asked", 10, "evening", !1, "Fold back the bed cover|Close curtains|Empty bins|Leave fresh water"),
	E("hk", "Change all bed linen (occupied rooms, every 3 days)", "বিছানার চাদর বদল", "Every occupied room", 15, "every 3 days", !1, "Change sheets and pillow covers|Count used linen to the linen room"),
	E("hk", "Flip and rotate mattresses", "ম্যাট্রেস উল্টানো", "Rooms on the deep-clean list", 10, "monthly", !1, "Flip head-to-foot and top-to-bottom|Check for stains or bugs|Report damaged mattresses", "low"),
	E("hk", "Clean under and behind beds", "খাটের নিচে পরিষ্কার", "Rooms on the deep-clean list", 20, "weekly", !0, "Move the bed out|Vacuum and mop underneath|Wipe the headboard and frame|Put the bed back straight"),
	E("hk", "Descale shower heads and taps", "শাওয়ার ও কল পরিষ্কার", "Bathrooms on the list", 15, "monthly", !1, "Soak shower heads in descaler|Scrub taps and drains|Rinse and wipe dry"),
	E("hk", "Clean AC grills in rooms", "রুমের এসি গ্রিল পরিষ্কার", "Rooms on the list", 10, "monthly", !0, "Switch AC off|Remove and wash the grill|Dry and refit|Switch on and check airflow"),
	E("hk", "Wash curtains", "পর্দা ধোয়া", "Floor on the schedule", 30, "every 3 months", !1, "Take curtains down carefully|Send to laundry with the room number|Rehang straight", "low"),
	E("hk", "Check every room for maintenance faults", "রুমের ত্রুটি পরীক্ষা", "All vacant rooms", 5, "weekly", !1, "Lights, sockets, AC, TV|Taps, flush, drains, shower|Door lock, safe, curtains|Write faults on the maintenance list"),
	E("hk", "Sweep for lost & found in vacated rooms", "হারানো জিনিস খোঁজা", "Rooms just checked out", 3, "per room", !1, "Look under beds, in drawers, cupboard, safe, bathroom|Hand anything found to the supervisor|Register it in the PMS Lost & Found"),
	E("hk", "Restock housekeeping trolleys", "ট্রলি পূরণ", "Service rooms", 15, "every shift", !1, "Linen, towels, amenities to par|Chemicals labelled and closed|Bags, gloves, cloths|Trolley wiped clean"),
	E("hk", "Clean the floor service room", "সার্ভিস রুম পরিষ্কার", "Each floor", 15, "daily", !1, "Tidy shelves|Mop the floor|Empty the soiled linen bag|Nothing on the floor"),
	E("pa", "Mop the lobby and entrance", "লবি মোছা", "Lobby", 20, "every 2 hours", !1, "Wet-floor sign out|Sweep then mop|Dry the entrance mat area|Sign back in"),
	E("pa", "Clean public toilets", "পাবলিক টয়লেট পরিষ্কার", "Lobby / Mawaid toilets", 15, "every 2 hours", !0, "Flush and clean toilets and urinals|Clean basins and mirrors|Refill soap and tissue|Mop the floor|Sign the checklist on the door", "high"),
	E("pa", "Clean all lift cars", "লিফট পরিষ্কার", "All lifts", 20, "twice a day", !1, "Wipe buttons inside and outside|Clean mirrors and walls|Mop the floor|Clean the door tracks"),
	E("pa", "Clean staircases top to bottom", "সিঁড়ি পরিষ্কার", "All staircases", 45, "daily", !1, "Sweep and mop every flight|Wipe handrails|Clear anything left on the stairs|Report broken lights"),
	E("pa", "Wipe door handles, handrails and lift buttons (disinfect)", "হাতল জীবাণুমুক্ত", "Lobby, lifts, corridors", 20, "every 3 hours", !1, "Use disinfectant on a cloth|Handles, push plates, rails, buttons|Change the cloth often"),
	E("pa", "Clean entrance glass doors and windows", "কাঁচের দরজা পরিষ্কার", "Entrance", 20, "daily", !1, "Spray and squeegee|Wipe the frames|No streaks"),
	E("pa", "Vacuum corridors", "করিডোর ভ্যাকুয়াম", "All corridors", 30, "daily", !1, "Vacuum carpets edge to edge|Pick up rubbish|Straighten anything out of place"),
	E("pa", "Clean corridor walls and skirting", "করিডোর দেয়াল পরিষ্কার", "Floor on the schedule", 30, "weekly", !1, "Wipe marks off walls|Wipe skirting boards|Clean room door frames", "low"),
	E("ln", "Count soiled linen from each floor", "ময়লা লিনেন গোনা", "Linen room", 20, "daily", !1, "Count by type: sheets, pillow covers, towels|Write per floor|Separate torn and stained"),
	E("ln", "Send linen to laundry with count sheet", "লন্ড্রিতে লিনেন পাঠানো", "Linen room", 15, "daily", !1, "Bag by type|Fill the count sheet|Get it signed by the laundry"),
	E("ln", "Count clean linen back and check quality", "পরিষ্কার লিনেন গোনা", "Linen room", 20, "daily", !1, "Count against the sheet sent|Return stained pieces for rewash|Fold and shelve by type"),
	E("ln", "Weekly linen stock count (par)", "সাপ্তাহিক লিনেন গণনা", "Linen room + floors", 60, "weekly", !0, "Count everything in store, floors and laundry|Compare with par (3 sets per bed)|Report shortage to the supervisor"),
	E("ln", "Clean laundry machine lint filters", "লন্ড্রি মেশিনের লিন্ট পরিষ্কার", "Laundry", 5, "every load", !1, "Switch off|Remove lint|Wipe the door seal", "high"),
	E("ln", "Descale and clean washing machines", "ওয়াশিং মেশিন পরিষ্কার", "Laundry", 30, "weekly", !1, "Run an empty hot wash with descaler|Clean the detergent drawer|Wipe the drum and seals", "low"),
	E("fb", "Lay the Mawaid hall for lunch", "দুপুরের খাবারের হল প্রস্তুত", "Mawaid hall", 45, "daily", !0, "Sweep and mop the floor|Lay safras in straight rows|Place water, glasses, tissues|Check the count with the supervisor", "high"),
	E("fb", "Lay the Mawaid hall for dinner", "রাতের খাবারের হল প্রস্তুত", "Mawaid hall", 45, "daily", !0, "Sweep and mop the floor|Lay safras in straight rows|Place water, glasses, tissues|Check the count with the supervisor", "high"),
	E("fb", "Set breakfast", "নাশতা প্রস্তুত", "Mawaid hall", 30, "daily", !1, "Lay tables|Tea, coffee, milk ready|Bread, butter, jam out|Keep hot food covered"),
	E("fb", "Clear and clean the hall after the meal", "খাবারের পর হল পরিষ্কার", "Mawaid hall", 40, "after each meal", !0, "Collect all thaals and dishes|Shake and fold safras|Sweep and mop|Empty bins"),
	E("fb", "Wash and stack thaals", "থাল ধোয়া", "Dish area", 45, "after each meal", !1, "Scrape and soak|Wash, rinse, sanitise|Dry and stack|Count against the issue"),
	E("fb", "Refill water dispensers and coolers", "পানির ডিসপেন্সার পূরণ", "Halls, corridors, lobby", 20, "every 3 hours", !1, "Change empty bottles|Wipe the tap and tray|Check cups are stocked"),
	E("fb", "Tea round", "চা পরিবেশন", "Lobby / hall", 30, "twice a day", !1, "Prepare tea and coffee|Serve to the lobby|Collect cups after"),
	E("fb", "Count heads at the meal (for thaal planning)", "খাবারে উপস্থিতি গণনা", "Mawaid hall", 15, "each meal", !1, "Count guests seated per row|Write the number with time|Tell the supervisor"),
	E("ks", "Wash and cut vegetables", "সবজি ধোয়া ও কাটা", "Kitchen prep area", 60, "daily", !1, "Wash under running water|Peel and cut to the chef's size|Cover and keep cold"),
	E("ks", "Clean rice and lentils", "চাল-ডাল বাছাই", "Kitchen", 30, "daily", !1, "Pick out stones|Wash three times|Soak as the chef says"),
	E("ks", "Log fridge and freezer temperatures", "ফ্রিজের তাপমাত্রা লেখা", "Kitchen cold rooms", 5, "twice a day", !0, "Read every fridge and freezer|Fridge 0–5°C, freezer -18°C or colder|Write the time and reading|Report anything out of range", "high"),
	E("ks", "Check expiry dates in fridges and stores", "মেয়াদ পরীক্ষা", "Kitchen + food store", 20, "daily", !1, "Check every item's date|Use oldest first|Throw out expired items and write them down", "high"),
	E("ks", "Deep clean the kitchen floor and drains", "রান্নাঘরের মেঝে ও ড্রেন পরিষ্কার", "Kitchen", 45, "daily", !1, "Move mobile equipment|Scrub floor with degreaser|Lift and clean drain covers|Rinse and squeegee dry"),
	E("ks", "Clean the exhaust hood and filters", "এক্সহস্ট হুড পরিষ্কার", "Kitchen", 60, "weekly", !0, "Cooking off and cool|Remove filters and soak in degreaser|Wipe the hood inside and out|Refit dry filters"),
	E("ks", "Empty and clean the grease trap", "গ্রিজ ট্র্যাপ পরিষ্কার", "Kitchen drain", 45, "weekly", !0, "Open the trap|Scoop out fat into a sealed bag|Scrub the walls|Close and record", "high"),
	E("ks", "Change dishwasher water and clean the machine", "ডিশওয়াশার পরিষ্কার", "Dish area", 20, "every shift", !1, "Drain the tank|Clean filters and arms|Refill and heat|Check chemicals"),
	E("ks", "Take out kitchen waste and wash bins", "রান্নাঘরের বর্জ্য ফেলা", "Kitchen", 20, "after each meal", !1, "Tie and take bags to the garbage room|Wash bins|New liners"),
	E("ks", "Clean gas burners and check for gas smell", "গ্যাস বার্নার পরিষ্কার", "Kitchen", 20, "daily", !1, "Burners off and cool|Clean burner heads|Check hoses for cracks|Report any gas smell at once", "high"),
	E("bd", "Receive an arriving bus — luggage to rooms", "আগত বাস — লাগেজ রুমে", "Entrance → rooms", 60, "per arrival", !0, "Be at the door before the bus|Count bags off the bus|Tag each bag with the room number|Take bags up within 30 minutes|Report bags with no name", "high"),
	E("bd", "Bring departing luggage down for the bus", "বিদায়ী লাগেজ নামানো", "Rooms → entrance", 45, "per departure", !0, "Collect bags from rooms 1 hour before the bus|Count per group|Line up at the entrance|Hand over to the bus loader", "high"),
	E("bd", "Luggage room count", "লাগেজ রুম গণনা", "Luggage room", 15, "every shift", !1, "Count all stored bags|Match tags with tickets|Report any extra or missing"),
	E("bd", "Clean and check luggage trolleys", "লাগেজ ট্রলি পরিষ্কার", "Bell desk", 15, "daily", !1, "Wipe frames|Check wheels roll freely|Report broken trolleys"),
	E("bd", "Help elderly / wheelchair guests", "বয়স্কদের সাহায্য", "Lobby / lifts", 15, "on request", !1, "Bring the wheelchair|Help to the lift and room|Tell the desk when done"),
	E("bd", "Keep the entrance clear", "প্রবেশপথ পরিষ্কার রাখা", "Entrance", 10, "every hour", !1, "Move bags and trolleys inside|Sweep the steps|Report anything blocking the door"),
	E("lu", "Load luggage onto the departure bus", "বাসে লাগেজ তোলা", "Bus bay", 30, "per bus", !0, "Count bags against the list|Heavy first, fragile on top|Close and lock the hold|Tell the coordinator the count", "high"),
	E("lu", "Unload luggage from an arrival bus", "বাস থেকে লাগেজ নামানো", "Bus bay", 30, "per bus", !1, "Line bags by group|Count against the list|Report damaged bags"),
	E("lu", "Unload a supplier delivery", "সরবরাহ নামানো", "Back gate", 30, "per delivery", !0, "Check the count with the delivery note|Check damage|Move to the store at once|Get the note signed"),
	E("lu", "Move water cartons to the floors", "পানির কার্টন বিতরণ", "Store → each floor", 45, "daily", !1, "Count cartons per floor|Use the trolley, not your back|Stack in the service room"),
	E("lu", "Sweep and wash the loading bay", "লোডিং বে পরিষ্কার", "Back gate", 20, "daily", !1, "Sweep|Wash with water|Clear cardboard to recycling"),
	E("st", "Issue amenities and supplies to floors", "ফ্লোরে সামগ্রী বিতরণ", "Store", 30, "daily", !1, "Check the request|Issue and write it on the bin card|Get the receiver to sign"),
	E("st", "Weekly stock count", "সাপ্তাহিক স্টক গণনা", "All stores", 90, "weekly", !0, "Count every item|Match with bin cards|List items below minimum"),
	E("st", "Check chemical labels and storage", "রাসায়নিক পরীক্ষা", "Chemical store", 15, "weekly", !1, "Every bottle labelled|Lids closed|Away from food|Gloves available"),
	E("st", "Key card stock count", "কি-কার্ড গণনা", "Front office store", 10, "daily", !1, "Count blank key cards|Count returned cards|Report low stock"),
	E("mt", "Clean AC filters (corridors & public areas)", "এসি ফিল্টার পরিষ্কার", "Corridors, halls", 60, "every 2 weeks", !0, "Switch off|Remove and wash filters|Dry and refit|Note units that drip or are noisy"),
	E("mt", "Check and replace burnt bulbs", "বাল্ব বদল", "All floors", 30, "daily", !1, "Walk every corridor and stair|Replace burnt bulbs|Report fittings that spark"),
	E("mt", "Check water heaters", "ওয়াটার হিটার পরীক্ষা", "Plant room / rooms on the list", 30, "weekly", !1, "Check temperature and leaks|Check the safety valve|Report rust or noise"),
	E("mt", "Unblock drains and toilets on request", "ড্রেন খোলা", "As reported", 20, "on request", !1, "Use the plunger / spring|Clean up after|Close the ticket"),
	E("mt", "Check generator and fuel", "জেনারেটর ও জ্বালানি পরীক্ষা", "Generator room", 15, "weekly", !0, "Read fuel level|Check oil and coolant|Run test for 10 minutes|Write the log"),
	E("mt", "Check water pumps and pressure", "পানির পাম্প পরীক্ষা", "Pump room", 15, "daily", !1, "Listen for noise|Read pressure|Check for leaks|Write the log"),
	E("mt", "Paint touch-ups", "রং মেরামত", "Rooms / corridors on the list", 60, "weekly", !1, "Fill marks and holes|Paint the same colour|Clean up after", "low"),
	E("mt", "Check door locks and closers", "দরজার তালা পরীক্ষা", "All floors", 45, "weekly", !1, "Every room door closes by itself|Lock works with the card|Fire doors close fully"),
	E("sf", "Patrol all floors", "সব ফ্লোর টহল", "All floors, stairs, roof", 30, "every 2 hours", !1, "Walk every corridor and stair|Check fire exits closed and clear|Check roof door locked|Write the time in the patrol log", "high"),
	E("sf", "Check fire extinguishers", "অগ্নিনির্বাপক পরীক্ষা", "All floors", 45, "monthly", !0, "Pressure needle in green|Seal and pin in place|Date not expired|Report missing ones", "high"),
	E("sf", "Test emergency lights and exit signs", "জরুরি বাতি পরীক্ষা", "Stairs, corridors", 30, "monthly", !1, "Press test button|Check exit signs lit|Report failures"),
	E("sf", "Lock and check service doors at night", "রাতে সার্ভিস দরজা বন্ধ", "Back gate, stores, roof", 20, "nightly", !1, "Lock each door|Pull to check|Write in the log"),
	E("sf", "Gate check of goods going out", "বাইরে যাওয়া মালামাল পরীক্ষা", "Back gate", 10, "every shift", !1, "Check gate pass for any hotel goods leaving|Note vehicle number|Report anything without a pass"),
	E("bo", "Collect garbage from all floors", "সব ফ্লোরের ময়লা সংগ্রহ", "All floors → garbage room", 45, "twice a day", !1, "Collect from every service room|Separate cardboard and plastic|Take to the garbage room"),
	E("bo", "Wash the garbage room and bins", "আবর্জনা ঘর ধোয়া", "Garbage room", 30, "daily", !0, "Empty to the municipal bin|Wash floor and bins|Spray disinfectant and insecticide|Close the door", "high"),
	E("bo", "Check water tank levels", "পানির ট্যাংক পরীক্ষা", "Roof / basement tanks", 15, "twice a day", !1, "Read the level|Order water if below half|Check for leaks"),
	E("bo", "Clean water tanks (with contractor)", "পানির ট্যাংক পরিষ্কার", "Roof tanks", 240, "every 3 months", !0, "Plan with the contractor|Empty, scrub, disinfect|Refill and test|Keep the certificate", "low"),
	E("bo", "Change drinking-water filters", "পানির ফিল্টার বদল", "Dispensers / RO unit", 30, "monthly", !0, "Switch off|Change cartridges|Flush|Write the date on the unit"),
	E("bo", "Clean floor drains and gully traps", "ফ্লোর ড্রেন পরিষ্কার", "Bathrooms, kitchen, roof", 45, "weekly", !1, "Lift covers|Remove hair and dirt|Pour hot water and cleaner|Refit covers"),
	E("bo", "Clean the roof and check for leaks", "ছাদ পরিষ্কার ও লিক পরীক্ষা", "Roof", 45, "weekly", !0, "Sweep the roof|Clear drain outlets|Check for cracks and water pooling|Lock the roof door"),
	E("bo", "Pest control round (traps and bait)", "কীটপতঙ্গ নিয়ন্ত্রণ", "Kitchen, stores, garbage room", 30, "weekly", !0, "Check every trap and bait station|Replace bait|Write sightings with place|Spray drains"),
	E("bo", "Fogging against mosquitoes", "মশার ফগিং", "Outside, garbage, drains", 30, "weekly", !1, "Wear mask and gloves|Fog drains and corners|Keep guests away while fogging", "low"),
	E("bo", "Clean behind kitchen equipment", "রান্নাঘরের সরঞ্জামের পেছন পরিষ্কার", "Kitchen", 60, "weekly", !1, "Pull out fridges and tables|Scrub floor and walls behind|Push back level"),
	E("bo", "Clean the staff room and staff toilets", "স্টাফ রুম পরিষ্কার", "Staff areas", 30, "daily", !1, "Sweep and mop|Clean toilets|Empty bins"),
	E("bo", "Wipe signage and notice boards", "সাইনবোর্ড পরিষ্কার", "Lobby, corridors, lifts", 20, "weekly", !1, "Dust and wipe signs|Remove old notices|Straighten frames", "low"),
	E("bo", "Check exhaust fans in bathrooms and corridors", "এক্সহস্ট ফ্যান পরীক্ষা", "All floors", 30, "monthly", !1, "Switch on|Check it pulls air|Clean the cover|Report noisy fans", "low"),
	E("tr", "Call groups for the bus 30 minutes before", "বাসের জন্য গ্রুপ ডাকা", "Lobby / rooms", 20, "per bus", !1, "Read the bus list|Call or knock each group|Tell the desk who is late", "high"),
	E("tr", "Count people boarding the bus", "বাসে যাত্রী গণনা", "Bus bay", 15, "per bus", !1, "Count heads against the list|Tell the desk the number|Report anyone missing", "high"),
	E("tr", "Load tosha (travel food) onto the bus", "বাসে খাবার তোলা", "Bus bay", 15, "per bus", !1, "Count packets per bus|Load before the guests board|Get the driver to confirm"),
	E("pr", "Clean the wudu area before namaz", "নামাজের আগে ওজুখানা পরিষ্কার", "Wudu area", 15, "5 times a day", !1, "Wash and squeegee the floor|Wipe taps and seats|Refill soap and tissues|Dry mats down", "high"),
	E("pr", "Arrange prayer mats and musallas", "জায়নামাজ সাজানো", "Prayer hall", 15, "5 times a day", !1, "Straight rows facing the qibla|Fold used mats|Vacuum the carpet once a day"),
	E("pr", "Arrange shoe racks", "জুতার র‍্যাক সাজানো", "Prayer hall entrance", 10, "5 times a day", !1, "Put shoes on racks|Clear the doorway|Wipe the racks once a day", "low")
], O = (e) => String(e).padStart(2, "0"), k = (e) => `${e.getFullYear()}-${O(e.getMonth() + 1)}-${O(e.getDate())}`, A = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), k(n);
}, j = (e, t) => {
	let n = [];
	for (let r = e; r <= t && n.length < 400; r = A(r, 1)) n.push(r);
	return n;
}, M = () => new Date(Date.now() + 108e5).toISOString().slice(0, 16), N = (e) => {
	let [t, n] = e.split(":").map(Number);
	return t * 60 + n;
}, P = (e) => Date.parse(e + ":00Z") / 6e4, F = (e) => `${Math.floor(e / 60)}:${O(Math.round(e % 60))}`, I = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).getDay();
function L(e, t, n, r) {
	let i = `${t}|${e.id}`;
	if (n.has(i)) {
		let e = n.get(i);
		return e == null ? null : r.find((t) => t.id === e) || null;
	}
	let a = r.find((t) => t.id === e.shift_id);
	return a && a.days.includes(I(t)) ? a : null;
}
function R(e, t, n, r, i, a, o = M()) {
	let s = n.filter((n) => n.staff_id === e.id && n.day === t).sort((e, t) => e.at.localeCompare(t.at)), c = s.filter((e) => e.kind === "in"), l = s.filter((e) => e.kind === "out"), u = L(e, t, r, i), d = a.find((n) => n.staff_id === e.id && n.status === "approved" && n.from_day <= t && n.to_day >= t), f = 0, p = null;
	for (let e of s) e.kind === "in" ? p ||= e : e.kind === "out" && p && (f += Math.max(0, P(e.at) - P(p.at)), p = null);
	p && t === o.slice(0, 10) && (f += Math.max(0, P(o) - P(p.at)));
	let m = c[0]?.at.slice(11, 16) || "", h = l[l.length - 1]?.at.slice(11, 16) || "", g = 0, _ = 0, v = 0;
	if (u) {
		let e = N(u.start), t = N(u.end), n = t <= e ? t + 1440 : t;
		if (v = Math.max(0, n - e - (u.break_min || 0)), m) {
			let t = N(m);
			t > e + (u.grace_min || 0) && (g = t - e);
		}
		if (h && !p) {
			let t = N(h) + (N(h) < e ? 1440 : 0);
			t < n && (_ = n - t);
		}
		f > 300 && (f = Math.max(0, f - (u.break_min || 0)));
	}
	let y = u ? Math.max(0, f - v) : f, b;
	b = d ? "leave" : p && t === o.slice(0, 10) ? g ? "late" : "working" : c.length ? g ? "late" : "present" : u ? t < o.slice(0, 10) || t === o.slice(0, 10) && o.slice(11, 16) > u.start ? "absent" : "upcoming" : "off";
	let x = [...new Set(s.flatMap((e) => String(e.flags || "").split(",").filter(Boolean)))];
	return s.some((e) => e.source === "manual") && x.push("manual"), {
		day: t,
		staff: e,
		shift: u,
		ins: c,
		outs: l,
		first: m,
		last: h,
		worked: Math.round(f),
		late: g,
		early: _,
		ot: Math.round(y),
		planned: v,
		status: b,
		leave: d,
		flags: x,
		refused: s.filter((e) => e.kind === "refused").length
	};
}
var z = {
	present: ["Present", "bg-emerald-100 text-emerald-900"],
	working: ["At work", "bg-emerald-100 text-emerald-900"],
	late: ["Late", "bg-amber-100 text-amber-900"],
	absent: ["Absent", "bg-red-100 text-red-900"],
	leave: ["On leave", "bg-sky-100 text-sky-900"],
	off: ["Day off", "bg-muted text-muted-foreground"],
	upcoming: ["Not yet", "bg-muted text-muted-foreground"]
}, B = (e, t, n) => e.filter((e) => e.staff_id === t && e.type === "annual" && e.status === "approved" && e.from_day.startsWith(n)).reduce((e, t) => e + t.days, 0), V = {
	"shared-phone": "📱 same phone as someone else today",
	"low-accuracy": "📍 weak location",
	manual: "✍️ entered by a manager",
	"no-blink": "👁 refused: no blink",
	face: "🙂 refused: face did not match",
	outside: "📍 refused: outside the circle",
	"no-location": "📍 refused: location off"
}, H = e(), U = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13", W = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
], G = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	weekday: "short",
	day: "2-digit",
	month: "short"
}), K = "h-9 rounded-md border bg-background px-2 text-sm", q = (e, t = 360, n = .75) => new Promise((r, i) => {
	let a = new Image();
	a.onload = () => {
		let e = Math.min(1, t / Math.max(a.width, a.height)), i = document.createElement("canvas");
		i.width = Math.round(a.width * e), i.height = Math.round(a.height * e), i.getContext("2d").drawImage(a, 0, 0, i.width, i.height), r(i.toDataURL("image/jpeg", n));
	}, a.onerror = i, a.src = URL.createObjectURL(e);
}), ee = (e, t) => {
	let n = t.map((e) => e.map((e) => `"${String(e ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n"), r = document.createElement("a");
	r.href = URL.createObjectURL(new Blob(["﻿" + n], { type: "text/csv" })), r.download = e, r.click();
};
function te() {
	let { cloud: e } = r(), t = n(), { site: i, siteId: o } = a(), { ask: s, dialog: c } = y(), l = (n, r, i) => t(e.request(n, r, i)), [u, h] = (0, S.useState)(null), [g, _] = (0, S.useState)(""), v = M().slice(0, 10), [b, x] = (0, S.useState)({
		from: A(v, -6),
		to: v
	}), [C, w] = (0, S.useState)([]), [T, E] = (0, S.useState)([]), [D, O] = (0, S.useState)(/* @__PURE__ */ new Map()), [k, j] = (0, S.useState)([]), [N, P] = (0, S.useState)("today"), F = async () => {
		try {
			h(await l("GET", `/api/hr/data?site=${o}`));
		} catch (e) {
			_(e.message);
		}
	}, I = async () => {
		let e = b.from < A(v, -1) ? b.from : A(v, -1), t = b.to > A(v, 13) ? b.to : A(v, 13);
		try {
			let [n, r, i, a] = await Promise.all([
				l("GET", `/api/hr/attendance?site=${o}&from=${e}&to=${b.to > v ? b.to : v}`),
				l("GET", `/api/hr/leaves?site=${o}`),
				l("GET", `/api/hr/schedule?site=${o}&from=${e}&to=${t}`),
				l("GET", `/api/hr/tasks?site=${o}&from=${e}&to=${t}`)
			]);
			w(n.punches), E(r.leaves), O(new Map(i.entries.map((e) => [`${e.day}|${e.staff_id}`, e.shift_id]))), j(a.tasks);
		} catch (e) {
			_(e.message);
		}
	};
	if ((0, S.useEffect)(() => {
		F();
	}, [o]), (0, S.useEffect)(() => {
		I();
		let e = setInterval(() => {
			document.visibilityState === "visible" && I();
		}, 6e4);
		return () => clearInterval(e);
	}, [
		o,
		b.from,
		b.to
	]), !u) return /* @__PURE__ */ (0, H.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: g || "Loading HR…"
	});
	let L = u.staff, R = u.shifts, z = u.roles, B = !!u.can_edit, V = L.filter((e) => e.active), U = {
		api: l,
		siteId: o,
		site: i,
		staff: L,
		active: V,
		shifts: R,
		roles: z,
		D: u,
		setD: h,
		can: B,
		punches: C,
		leaves: T,
		roster: D,
		tasks: k,
		today: v,
		range: b,
		setRange: x,
		reload: I,
		reloadAll: async () => {
			await F(), await I();
		},
		confirm: s
	}, W = T.filter((e) => e.status === "pending").length;
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "mx-auto grid max-w-[1800px] gap-4 px-3 pb-12 pt-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, H.jsxs)("div", { children: [/* @__PURE__ */ (0, H.jsx)("h1", {
					className: "font-serif text-3xl font-black",
					children: "HR"
				}), /* @__PURE__ */ (0, H.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [i.label, " · staff, attendance, roster, leave and tasks"]
				})] }), /* @__PURE__ */ (0, H.jsx)($, { siteId: o })]
			}),
			g && /* @__PURE__ */ (0, H.jsx)("p", {
				className: "text-sm text-destructive",
				children: g
			}),
			/* @__PURE__ */ (0, H.jsxs)(m, {
				value: N,
				onValueChange: P,
				children: [
					/* @__PURE__ */ (0, H.jsx)(p, {
						variant: "underline",
						className: "flex-wrap",
						children: [
							["today", "📊 Today"],
							["staff", `👥 Staff (${V.length})`],
							["attendance", "🕒 Attendance"],
							["roster", "🗓️ Roster"],
							["leave", `🤒 Leave${W ? ` (${W})` : ""}`],
							["tasks", "📋 Tasks"],
							["setup", "🧩 Roles & shifts"],
							["settings", "⚙️ Settings"]
						].map(([e, t]) => /* @__PURE__ */ (0, H.jsx)(d, {
							value: e,
							children: t
						}, e))
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "today",
						children: /* @__PURE__ */ (0, H.jsx)(Z, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "staff",
						children: /* @__PURE__ */ (0, H.jsx)(ne, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "attendance",
						children: /* @__PURE__ */ (0, H.jsx)(ae, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "roster",
						children: /* @__PURE__ */ (0, H.jsx)(oe, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "leave",
						children: /* @__PURE__ */ (0, H.jsx)(se, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "tasks",
						children: /* @__PURE__ */ (0, H.jsx)(Q, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "setup",
						children: /* @__PURE__ */ (0, H.jsx)(le, { ...U })
					}),
					/* @__PURE__ */ (0, H.jsx)(f, {
						value: "settings",
						children: /* @__PURE__ */ (0, H.jsx)(ue, { ...U })
					})
				]
			}),
			c
		]
	});
}
var J = ({ s: e, cls: t = "size-10" }) => e?.photo ? /* @__PURE__ */ (0, H.jsx)("img", {
	src: e.photo,
	alt: "",
	className: v(t, "shrink-0 rounded-full object-cover")
}) : /* @__PURE__ */ (0, H.jsx)("span", {
	className: v(t, "grid shrink-0 place-items-center rounded-full bg-muted"),
	children: "👤"
}), Y = ({ v: e, l: t, tone: n }) => /* @__PURE__ */ (0, H.jsxs)("div", {
	className: v("min-w-28 rounded-xl border bg-card p-3", n),
	children: [/* @__PURE__ */ (0, H.jsx)("b", {
		className: "block font-serif text-3xl",
		children: e
	}), /* @__PURE__ */ (0, H.jsx)("small", {
		className: "text-xs uppercase tracking-wider text-muted-foreground",
		children: t
	})]
});
function X(e) {
	let [t, n] = (0, S.useState)(null);
	return {
		node: t && /* @__PURE__ */ (0, H.jsx)(u, {
			open: !0,
			onOpenChange: () => n(null),
			children: /* @__PURE__ */ (0, H.jsxs)(s, {
				className: "max-w-sm",
				children: [/* @__PURE__ */ (0, H.jsx)(o, { children: /* @__PURE__ */ (0, H.jsx)(c, { children: "Selfie" }) }), /* @__PURE__ */ (0, H.jsx)("img", {
					src: t,
					alt: "Selfie",
					className: "w-full rounded-xl"
				})]
			})
		}),
		open: async (t) => {
			let r = await e("GET", `/api/hr/attendance/${t}/selfie`);
			n(r.selfie || "");
		}
	};
}
function Z(e) {
	let t = e.active.map((t) => R(t, e.today, e.punches, e.roster, e.shifts, e.leaves)), n = (e) => t.filter((t) => e.includes(t.status)).length, r = e.tasks.filter((t) => t.day === e.today), i = X(e.api), a = [
		"absent",
		"late",
		"working",
		"present",
		"upcoming",
		"leave",
		"off"
	];
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: t.filter((e) => e.shift).length,
						l: "On shift today"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: n([
							"present",
							"working",
							"late"
						]),
						l: "Came",
						tone: "border-emerald-300"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: n(["late"]),
						l: "Late",
						tone: "border-amber-300"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: n(["absent"]),
						l: "Absent",
						tone: "border-red-300"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: n(["leave"]),
						l: "On leave"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: `${r.filter((e) => e.status === "done" || e.status === "verified").length}/${r.length}`,
						l: "Tasks done"
					}),
					/* @__PURE__ */ (0, H.jsx)(Y, {
						v: t.reduce((e, t) => e + t.refused, 0),
						l: "Refused check-ins",
						tone: "border-red-200"
					})
				]
			}),
			/* @__PURE__ */ (0, H.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: t.sort((e, t) => a.indexOf(e.status) - a.indexOf(t.status)).map((e) => /* @__PURE__ */ (0, H.jsxs)(g, {
					className: "flex-row items-center gap-3 p-3",
					children: [
						/* @__PURE__ */ (0, H.jsx)(J, {
							s: e.staff,
							cls: "size-12"
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid min-w-0 flex-1 gap-0.5",
							children: [
								/* @__PURE__ */ (0, H.jsx)("b", {
									className: "truncate",
									children: e.staff.name
								}),
								/* @__PURE__ */ (0, H.jsxs)("small", {
									className: "text-muted-foreground",
									children: [
										e.shift ? `${e.shift.name} ${e.shift.start}–${e.shift.end}` : "no shift",
										e.first ? ` · in ${e.first}` : "",
										e.last ? ` · out ${e.last}` : "",
										e.late ? ` · ${e.late} min late` : ""
									]
								}),
								(e.flags.length > 0 || e.refused > 0) && /* @__PURE__ */ (0, H.jsx)("small", {
									className: "text-red-700 dark:text-red-400",
									children: [...e.flags.map((e) => V[e] || e), e.refused ? `❌ ${e.refused} refused` : ""].filter(Boolean).join(" · ")
								})
							]
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid justify-items-end gap-1",
							children: [/* @__PURE__ */ (0, H.jsx)("span", {
								className: v("rounded-full px-2 py-0.5 text-xs font-semibold", z[e.status][1]),
								children: z[e.status][0]
							}), e.ins[0] && /* @__PURE__ */ (0, H.jsx)("button", {
								type: "button",
								className: "text-xs text-primary underline",
								onClick: () => void i.open(e.ins[0].id),
								children: "selfie"
							})]
						})
					]
				}, e.staff.id))
			}),
			!e.active.length && /* @__PURE__ */ (0, H.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Add your staff on the Staff tab, enroll their faces and give each a PIN."
			}),
			i.node
		]
	});
}
function ne(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), [a, d] = (0, S.useState)(null), [f, p] = (0, S.useState)(""), [m, y] = (0, S.useState)(!1), x = (t) => e.roles.find((e) => e.id === t), C = e.staff.filter((e) => (m || e.active) && (!f || [
		e.name,
		e.name_local,
		e.emp_no,
		e.phone
	].some((e) => String(e || "").toLowerCase().includes(f.toLowerCase()))));
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, H.jsx)(_, {
						type: "search",
						className: "max-w-xs",
						placeholder: "🔎 Name, number, phone",
						value: f,
						onChange: (e) => p(e.target.value)
					}),
					/* @__PURE__ */ (0, H.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, H.jsx)("input", {
							type: "checkbox",
							checked: m,
							onChange: (e) => y(e.target.checked)
						}), "Show inactive"]
					}),
					e.can && /* @__PURE__ */ (0, H.jsx)(h, {
						className: "ml-auto",
						onClick: () => n({ active: !0 }),
						children: "➕ Add staff"
					})
				]
			}),
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: [C.map((t) => /* @__PURE__ */ (0, H.jsxs)(g, {
					className: v("flex-row gap-3 p-3", !t.active && "opacity-60"),
					children: [/* @__PURE__ */ (0, H.jsx)(J, {
						s: t,
						cls: "size-16"
					}), /* @__PURE__ */ (0, H.jsxs)("div", {
						className: "grid min-w-0 flex-1 gap-0.5 text-sm",
						children: [
							/* @__PURE__ */ (0, H.jsx)("b", {
								className: "truncate text-base",
								children: t.name
							}),
							t.name_local && /* @__PURE__ */ (0, H.jsx)("span", {
								className: "text-muted-foreground",
								children: t.name_local
							}),
							/* @__PURE__ */ (0, H.jsx)("span", {
								className: "text-muted-foreground",
								children: [
									t.emp_no && "#" + t.emp_no,
									x(t.role_id)?.title,
									e.shifts.find((e) => e.id === t.shift_id)?.name,
									t.phone
								].filter(Boolean).join(" · ") || "—"
							}),
							/* @__PURE__ */ (0, H.jsxs)("span", {
								className: "flex flex-wrap gap-1",
								children: [/* @__PURE__ */ (0, H.jsx)(b, {
									variant: t.has_face ? "default" : "outline",
									children: t.has_face ? "🙂 face enrolled" : "⚠ no face"
								}), /* @__PURE__ */ (0, H.jsx)(b, {
									variant: t.has_pin ? "default" : "outline",
									children: t.has_pin ? "🔢 PIN set" : "⚠ no PIN"
								})]
							}),
							e.can && /* @__PURE__ */ (0, H.jsxs)("span", {
								className: "mt-1 flex flex-wrap gap-1",
								children: [
									/* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => n(t),
										children: "✏️ Edit"
									}),
									/* @__PURE__ */ (0, H.jsxs)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => i(t),
										children: ["📸 ", t.has_face ? "Re-enroll face" : "Enroll face"]
									}),
									/* @__PURE__ */ (0, H.jsxs)(h, {
										size: "sm",
										variant: "outline",
										onClick: async () => {
											if (t.has_pin && !await e.confirm({
												title: `New PIN for ${t.name}?`,
												body: "The old PIN stops working.",
												confirmLabel: "New PIN"
											})) return;
											let n = await e.api("POST", `/api/hr/staff/${t.id}/pin`, {});
											d({
												s: t,
												pin: n.pin
											}), await e.reloadAll();
										},
										children: ["🔢 ", t.has_pin ? "New PIN" : "Give PIN"]
									})
								]
							})
						]
					})]
				}, t.id)), !C.length && /* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No staff yet."
				})]
			}),
			t && /* @__PURE__ */ (0, H.jsx)(re, {
				c: e,
				s: t,
				onClose: () => n(null)
			}),
			r && /* @__PURE__ */ (0, H.jsx)(ie, {
				c: e,
				s: r,
				onClose: () => i(null)
			}),
			a && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => d(null),
				children: /* @__PURE__ */ (0, H.jsxs)(s, {
					className: "max-w-sm text-center",
					children: [
						/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsxs)(c, { children: ["PIN for ", a.s.name] }), /* @__PURE__ */ (0, H.jsx)(l, { children: "Shown only now — write it on their card. They type it on the check-in page." })] }),
						/* @__PURE__ */ (0, H.jsx)("div", {
							className: "font-mono text-6xl font-black tracking-[0.3em]",
							children: a.pin
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							variant: "outline",
							onClick: () => {
								let e = window.open("", "_blank");
								e && (e.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:30px"><div style="border:3px solid #000;border-radius:16px;padding:20px;display:inline-block;min-width:280px">${a.s.photo ? `<img src="${a.s.photo}" style="width:120px;height:120px;border-radius:50%;object-fit:cover">` : ""}<h2>${a.s.name}</h2>${a.s.name_local ? `<h3>${a.s.name_local}</h3>` : ""}<p>হাজিরা নম্বর · Attendance PIN</p><div style="font-size:64px;font-weight:900;letter-spacing:12px">${a.pin}</div></div><script>print()<\/script></body></html>`), e.document.close());
							},
							children: "🖨 Print card"
						})
					]
				})
			})
		]
	});
}
function re({ c: e, s: t, onClose: n }) {
	let [r, i] = (0, S.useState)({ ...t }), [a, l] = (0, S.useState)(""), d = (e, t) => i((n) => ({
		...n,
		[e]: t
	})), f = (e, t, n = {}) => /* @__PURE__ */ (0, H.jsxs)("label", {
		className: "grid gap-1 text-xs font-semibold",
		children: [e, /* @__PURE__ */ (0, H.jsx)(_, {
			value: r[t] ?? "",
			onChange: (e) => d(t, e.target.value),
			...n
		})]
	});
	async function p() {
		try {
			let t = {
				site: e.siteId,
				...r
			}, i = r.id ? await e.api("PUT", `/api/hr/staff/${r.id}`, t) : await e.api("POST", "/api/hr/staff", t);
			e.setD({
				...e.D,
				...i
			}), n();
		} catch (e) {
			l(e.message);
		}
	}
	return /* @__PURE__ */ (0, H.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, H.jsxs)(s, {
			className: "max-h-[90vh] max-w-xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, H.jsx)(o, { children: /* @__PURE__ */ (0, H.jsx)(c, { children: r.id ? `Edit ${t.name}` : "Add staff" }) }),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						f("Name (English)", "name"),
						f("Name (Bangla / own language)", "name_local"),
						f("Staff number", "emp_no"),
						f("Mobile", "phone"),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Job role", /* @__PURE__ */ (0, H.jsxs)("select", {
								className: K,
								value: r.role_id ?? "",
								onChange: (e) => d("role_id", Number(e.target.value) || null),
								children: [/* @__PURE__ */ (0, H.jsx)("option", {
									value: "",
									children: "—"
								}), e.roles.map((e) => /* @__PURE__ */ (0, H.jsx)("option", {
									value: e.id,
									children: e.title
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Usual shift", /* @__PURE__ */ (0, H.jsxs)("select", {
								className: K,
								value: r.shift_id ?? "",
								onChange: (e) => d("shift_id", Number(e.target.value) || null),
								children: [/* @__PURE__ */ (0, H.jsx)("option", {
									value: "",
									children: "—"
								}), e.shifts.map((e) => /* @__PURE__ */ (0, H.jsxs)("option", {
									value: e.id,
									children: [
										e.name,
										" ",
										e.start,
										"–",
										e.end
									]
								}, e.id))]
							})]
						}),
						f("Department", "dept"),
						f("Nationality", "nationality"),
						f("Monthly wage (SAR)", "wage", {
							type: "number",
							min: 0
						}),
						f("Joined on", "joined_on", { type: "date" }),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold sm:col-span-2",
							children: ["Notes", /* @__PURE__ */ (0, H.jsx)(x, {
								value: r.notes ?? "",
								onChange: (e) => d("notes", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, H.jsx)("input", {
								type: "checkbox",
								checked: r.active !== !1,
								onChange: (e) => d("active", e.target.checked)
							}), "Active (can check in)"]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "text-xs font-semibold",
							children: ["Photo ", /* @__PURE__ */ (0, H.jsx)("input", {
								type: "file",
								accept: "image/*",
								onChange: async (e) => {
									e.target.files?.[0] && d("photo", await q(e.target.files[0], 360));
								}
							})]
						})
					]
				}),
				a && /* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-sm text-destructive",
					children: a
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [r.id ? /* @__PURE__ */ (0, H.jsx)(h, {
						variant: "ghost",
						className: "text-destructive",
						onClick: async () => {
							await e.confirm({
								title: `Remove ${t.name}?`,
								body: "Their attendance and leave records stay.",
								confirmLabel: "Remove"
							}) && (e.setD({
								...e.D,
								...await e.api("DELETE", `/api/hr/staff/${r.id}`)
							}), n());
						},
						children: "🗑 Remove"
					}) : /* @__PURE__ */ (0, H.jsx)("span", {}), /* @__PURE__ */ (0, H.jsxs)("span", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, H.jsx)(h, {
							variant: "outline",
							onClick: n,
							children: "Cancel"
						}), /* @__PURE__ */ (0, H.jsx)(h, {
							onClick: () => void p(),
							children: "Save"
						})]
					})]
				})
			]
		})
	});
}
function ie({ c: e, s: t, onClose: n }) {
	let r = (0, S.useRef)(null), [i, a] = (0, S.useState)("Starting the camera…"), [d, f] = (0, S.useState)(!1), p = (0, S.useRef)(null), m = (0, S.useRef)(null);
	(0, S.useEffect)(() => {
		let e = !1;
		return (async () => {
			try {
				if (m.current = await navigator.mediaDevices.getUserMedia({ video: {
					facingMode: "user",
					width: { ideal: 640 }
				} }), e) return;
				r.current.srcObject = m.current, await r.current.play(), a("Loading face models (first time takes a moment)…");
				let n = await import(
					/* @vite-ignore */
					`${U}/dist/face-api.esm.js`
);
				for (let e of [
					"tinyFaceDetector",
					"faceLandmark68Net",
					"faceRecognitionNet"
				]) await n.nets[e].loadFromUri(`${U}/model/`);
				p.current = n, a(`Ask ${t.name} to look straight at the camera, in good light, then press Capture.`);
			} catch (e) {
				a("Camera / models not available: " + (e.message || e));
			}
		})(), () => {
			e = !0, m.current?.getTracks().forEach((e) => e.stop());
		};
	}, []);
	async function g() {
		let i = p.current;
		if (i) {
			f(!0);
			try {
				let o = new i.TinyFaceDetectorOptions({
					inputSize: 320,
					scoreThreshold: .5
				}), s = [];
				for (let e = 0; e < 3; e++) {
					a(`Look ${e + 1} of 3…`);
					let t = await i.detectSingleFace(r.current, o).withFaceLandmarks().withFaceDescriptor();
					t && s.push(t.descriptor), await new Promise((e) => setTimeout(e, 900));
				}
				if (s.length < 2) {
					a("No clear face — better light, face the camera, try again.");
					return;
				}
				let c = Array.from({ length: 128 }, (e, t) => s.reduce((e, n) => e + n[t], 0) / s.length), l = document.createElement("canvas");
				l.width = r.current.videoWidth, l.height = r.current.videoHeight, l.getContext("2d").drawImage(r.current, 0, 0);
				let u = await q(await new Promise((e) => l.toBlob((t) => e(t), "image/jpeg", .85)), 360);
				e.setD({
					...e.D,
					...await e.api("POST", `/api/hr/staff/${t.id}/face`, {
						descriptor: c,
						photo: u
					})
				}), n();
			} catch (e) {
				a(e.message);
			} finally {
				f(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, H.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, H.jsxs)(s, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsxs)(c, { children: ["📸 Enroll the face of ", t.name] }), /* @__PURE__ */ (0, H.jsx)(l, { children: "Only the person themself, in person. Tell them their photo is kept for attendance only." })] }),
				/* @__PURE__ */ (0, H.jsx)("video", {
					ref: r,
					playsInline: !0,
					muted: !0,
					className: "aspect-[3/4] w-full -scale-x-100 rounded-xl bg-black object-cover"
				}),
				/* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-sm",
					children: i
				}),
				/* @__PURE__ */ (0, H.jsx)(h, {
					disabled: d || !p.current,
					onClick: () => void g(),
					children: d ? "Capturing…" : "📸 Capture"
				})
			]
		})
	});
}
function ae(e) {
	let [t, n] = (0, S.useState)(0), [r, i] = (0, S.useState)(null), [a, d] = (0, S.useState)(null), f = X(e.api), p = j(e.range.from, e.range.to > e.today ? e.today : e.range.to), m = (0, S.useMemo)(() => p.flatMap((n) => e.staff.filter((e) => t ? e.id === t : e.active).map((t) => R(t, n, e.punches, e.roster, e.shifts, e.leaves))).filter((e) => e.status !== "off" || e.ins.length), [
		p.join(),
		t,
		e.punches,
		e.roster,
		e.leaves,
		e.staff
	]), y = /* @__PURE__ */ new Map();
	for (let e of m) {
		let t = y.get(e.staff.id) || {
			s: e.staff,
			days: 0,
			absent: 0,
			late: 0,
			lateMin: 0,
			worked: 0,
			ot: 0,
			leave: 0
		};
		e.ins.length && t.days++, e.status === "absent" && t.absent++, e.late && (t.late++, t.lateMin += e.late), t.worked += e.worked, t.ot += e.ot, e.status === "leave" && t.leave++, y.set(e.staff.id, t);
	}
	let b = e.D.settings.otRate || 1.5, x = (e) => (Number(e.wage) || 0) / 30 / 8;
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [
					/* @__PURE__ */ (0, H.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["From", /* @__PURE__ */ (0, H.jsx)(_, {
							type: "date",
							value: e.range.from,
							onChange: (t) => e.setRange({
								...e.range,
								from: t.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, H.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["To", /* @__PURE__ */ (0, H.jsx)(_, {
							type: "date",
							value: e.range.to,
							onChange: (t) => e.setRange({
								...e.range,
								to: t.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, H.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Person", /* @__PURE__ */ (0, H.jsxs)("select", {
							className: K,
							value: t,
							onChange: (e) => n(Number(e.target.value)),
							children: [/* @__PURE__ */ (0, H.jsx)("option", {
								value: 0,
								children: "Everyone"
							}), e.staff.map((e) => /* @__PURE__ */ (0, H.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						})]
					}),
					/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => ee(`timesheet_${e.range.from}_${e.range.to}.csv`, [[
							"Date",
							"Name",
							"Shift",
							"In",
							"Out",
							"Worked",
							"Late min",
							"Early min",
							"Overtime",
							"Status",
							"Flags"
						], ...m.map((e) => [
							e.day,
							e.staff.name,
							e.shift?.name || "",
							e.first,
							e.last,
							F(e.worked),
							e.late,
							e.early,
							F(e.ot),
							z[e.status][0],
							e.flags.join(" ")
						])]),
						children: "⬇️ CSV"
					}),
					e.can && /* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => i({
							kind: "in",
							at: M()
						}),
						children: "✍️ Add a missed punch"
					})
				]
			}),
			/* @__PURE__ */ (0, H.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, H.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, H.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, H.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Days"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Absent"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Late (times · min)"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Worked"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Overtime"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Leave days"
							}),
							/* @__PURE__ */ (0, H.jsxs)("th", {
								className: "p-2 text-right",
								children: [
									"Overtime pay (×",
									b,
									")"
								]
							})
						] })
					}), /* @__PURE__ */ (0, H.jsx)("tbody", { children: [...y.values()].map((e) => /* @__PURE__ */ (0, H.jsxs)("tr", {
						className: "border-t",
						children: [
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, H.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, H.jsx)(J, {
										s: e.s,
										cls: "size-7"
									}), e.s.name]
								})
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: e.days
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: e.absent
							}),
							/* @__PURE__ */ (0, H.jsxs)("td", {
								className: "p-2 text-right",
								children: [
									e.late,
									" · ",
									e.lateMin
								]
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: F(e.worked)
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: F(e.ot)
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: e.leave
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: e.s.wage ? `${(x(e.s) * b * e.ot / 60).toFixed(2)} SAR` : "—"
							})
						]
					}, e.s.id)) })]
				})
			}),
			/* @__PURE__ */ (0, H.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, H.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, H.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, H.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Day"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Shift"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "In"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Out"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Worked"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Late"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Early"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "OT"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Checks"
							})
						] })
					}), /* @__PURE__ */ (0, H.jsx)("tbody", { children: m.slice().reverse().map((t) => {
						let n = `${t.day}|${t.staff.id}`, r = e.punches.filter((e) => e.staff_id === t.staff.id && e.day === t.day);
						return [/* @__PURE__ */ (0, H.jsxs)("tr", {
							className: "cursor-pointer border-t hover:bg-accent/40",
							onClick: () => d(a === n ? null : n),
							children: [
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2 whitespace-nowrap",
									children: G(t.day)
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2",
									children: t.staff.name
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2",
									children: t.shift ? `${t.shift.start}–${t.shift.end}` : "—"
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2",
									children: t.first || "—"
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2",
									children: t.last || "—"
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2 text-right",
									children: F(t.worked)
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: v("p-2 text-right", t.late && "font-semibold text-amber-700"),
									children: t.late || ""
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: v("p-2 text-right", t.early && "text-amber-700"),
									children: t.early || ""
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2 text-right",
									children: t.ot ? F(t.ot) : ""
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2",
									children: /* @__PURE__ */ (0, H.jsx)("span", {
										className: v("rounded-full px-2 py-0.5 text-xs font-semibold", z[t.status][1]),
										children: z[t.status][0]
									})
								}),
								/* @__PURE__ */ (0, H.jsx)("td", {
									className: "p-2 text-xs text-red-700",
									children: [...t.flags.map((e) => V[e] || e), t.refused ? `❌ ${t.refused} refused` : ""].filter(Boolean).join(" · ")
								})
							]
						}, n), a === n && /* @__PURE__ */ (0, H.jsx)("tr", {
							className: "bg-muted/30",
							children: /* @__PURE__ */ (0, H.jsx)("td", {
								colSpan: 11,
								className: "p-2",
								children: /* @__PURE__ */ (0, H.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [r.map((t) => /* @__PURE__ */ (0, H.jsxs)("span", {
										className: v("flex items-center gap-2 rounded-lg border bg-card px-2 py-1 text-xs", t.kind === "refused" && "border-red-300"),
										children: [
											/* @__PURE__ */ (0, H.jsx)("b", { children: t.kind.toUpperCase() }),
											" ",
											t.at.slice(11, 16),
											" · ",
											t.source,
											t.dist == null ? "" : ` · ${t.dist} m`,
											t.face_dist == null ? "" : ` · face ${t.face_dist}`,
											t.note ? ` · ${t.note}` : "",
											t.has_selfie ? /* @__PURE__ */ (0, H.jsx)("button", {
												type: "button",
												className: "text-primary underline",
												onClick: () => void f.open(t.id),
												children: "selfie"
											}) : null,
											e.can && t.source === "manual" && /* @__PURE__ */ (0, H.jsx)("button", {
												type: "button",
												className: "text-destructive",
												onClick: async () => {
													await e.api("DELETE", `/api/hr/attendance/${t.id}`), await e.reload();
												},
												children: "✕"
											})
										]
									}, t.id)), !r.length && /* @__PURE__ */ (0, H.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "No punches."
									})]
								})
							})
						}, n + "x")];
					}) })]
				})
			}),
			r && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, H.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsx)(c, { children: "Add a missed punch" }), /* @__PURE__ */ (0, H.jsx)(l, { children: "Kept as “entered by a manager”, with your reason." })] }),
						/* @__PURE__ */ (0, H.jsxs)("select", {
							className: K,
							value: r.staff_id ?? "",
							onChange: (e) => i({
								...r,
								staff_id: Number(e.target.value)
							}),
							children: [/* @__PURE__ */ (0, H.jsx)("option", {
								value: "",
								children: "Person…"
							}), e.active.map((e) => /* @__PURE__ */ (0, H.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						}),
						/* @__PURE__ */ (0, H.jsxs)("select", {
							className: K,
							value: r.kind,
							onChange: (e) => i({
								...r,
								kind: e.target.value
							}),
							children: [/* @__PURE__ */ (0, H.jsx)("option", {
								value: "in",
								children: "IN"
							}), /* @__PURE__ */ (0, H.jsx)("option", {
								value: "out",
								children: "OUT"
							})]
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							type: "datetime-local",
							value: r.at,
							onChange: (e) => i({
								...r,
								at: e.target.value
							})
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							placeholder: "Reason (required)",
							value: r.note ?? "",
							onChange: (e) => i({
								...r,
								note: e.target.value
							})
						}),
						r.err && /* @__PURE__ */ (0, H.jsx)("p", {
							className: "text-sm text-destructive",
							children: r.err
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							onClick: async () => {
								try {
									await e.api("POST", "/api/hr/attendance", {
										site: e.siteId,
										...r
									}), i(null), await e.reload();
								} catch (e) {
									i({
										...r,
										err: e.message
									});
								}
							},
							children: "Save"
						})
					]
				})
			}),
			f.node
		]
	});
}
function oe(e) {
	let [t, n] = (0, S.useState)(() => {
		let t = e.today;
		return A(t, -I(t));
	}), r = j(t, A(t, 6)), [i, a] = (0, S.useState)(/* @__PURE__ */ new Map()), [o, s] = (0, S.useState)(""), c = (t, n) => {
		let r = `${t}|${n.id}`;
		if (i.has(r)) {
			let a = i.get(r);
			return a === void 0 ? L(n, t, /* @__PURE__ */ new Map(), e.shifts)?.id ?? "off" : a ?? "off";
		}
		return e.roster.has(r) ? e.roster.get(r) ?? "off" : L(n, t, /* @__PURE__ */ new Map(), e.shifts)?.id ?? "off";
	};
	async function l(t = i) {
		let n = [...t].map(([e, t]) => {
			let [n, r] = e.split("|");
			return {
				day: n,
				staff_id: Number(r),
				shift_id: t
			};
		});
		await e.api("PUT", "/api/hr/schedule", {
			site: e.siteId,
			entries: n
		}), a(/* @__PURE__ */ new Map()), s(`Saved ${n.length} change(s).`), await e.reload();
	}
	async function u() {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.active) for (let i of r) {
			let r = `${A(i, -7)}|${n.id}`;
			e.roster.has(r) && t.set(`${i}|${n.id}`, e.roster.get(r) ?? null);
		}
		t.size ? await l(t) : s("Last week has no roster changes to copy.");
	}
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => n(A(t, -7)),
						children: "◀"
					}),
					/* @__PURE__ */ (0, H.jsxs)("b", { children: [
						G(r[0]),
						" – ",
						G(r[6])
					] }),
					/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => n(A(t, 7)),
						children: "▶"
					}),
					e.can && /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [/* @__PURE__ */ (0, H.jsxs)(h, {
						disabled: !i.size,
						onClick: () => void l(),
						children: [
							"Save roster (",
							i.size,
							")"
						]
					}), /* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => void u(),
						children: "Copy last week"
					})] }),
					/* @__PURE__ */ (0, H.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: o
					})
				]
			}),
			/* @__PURE__ */ (0, H.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Each person works their usual shift on its weekdays unless changed here. Choose “off” for a day off."
			}),
			/* @__PURE__ */ (0, H.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, H.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, H.jsx)("thead", {
						className: "bg-muted/60",
						children: /* @__PURE__ */ (0, H.jsxs)("tr", { children: [/* @__PURE__ */ (0, H.jsx)("th", {
							className: "p-2 text-left",
							children: "Person"
						}), r.map((t) => /* @__PURE__ */ (0, H.jsx)("th", {
							className: v("p-2", t === e.today && "bg-primary/10"),
							children: G(t)
						}, t))] })
					}), /* @__PURE__ */ (0, H.jsx)("tbody", { children: e.active.map((t) => /* @__PURE__ */ (0, H.jsxs)("tr", {
						className: "border-t",
						children: [/* @__PURE__ */ (0, H.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, H.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, H.jsx)(J, {
									s: t,
									cls: "size-7"
								}), t.name]
							})
						}), r.map((n) => {
							let r = c(n, t), i = e.shifts.find((e) => e.id === r), o = e.leaves.find((e) => e.staff_id === t.id && e.status === "approved" && e.from_day <= n && e.to_day >= n);
							return /* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-1 text-center",
								style: { background: i ? i.color + "22" : void 0 },
								children: o ? /* @__PURE__ */ (0, H.jsxs)("span", {
									className: "text-xs font-semibold text-sky-700",
									children: ["🤒 ", o.type]
								}) : /* @__PURE__ */ (0, H.jsxs)("select", {
									disabled: !e.can,
									className: "h-8 w-full rounded border bg-background px-1 text-xs",
									value: String(r),
									onChange: (e) => a((r) => new Map(r).set(`${n}|${t.id}`, e.target.value === "off" ? null : Number(e.target.value))),
									children: [/* @__PURE__ */ (0, H.jsx)("option", {
										value: "off",
										children: "off"
									}), e.shifts.map((e) => /* @__PURE__ */ (0, H.jsxs)("option", {
										value: e.id,
										children: [
											e.name,
											" ",
											e.start
										]
									}, e.id))]
								})
							}, n);
						})]
					}, t.id)) })]
				})
			})
		]
	});
}
function se(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), a = (t) => e.staff.find((e) => e.id === t)?.name || "—", l = e.today.slice(0, 4), d = e.D.settings.annualDays ?? 21, f = [...e.leaves].sort((e, t) => (e.status === "pending" ? -1 : 0) - (t.status === "pending" ? -1 : 0)), p = async (t, n) => {
		await e.api("PUT", `/api/hr/leaves/${t.id}`, { status: n }), await e.reload();
	};
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [e.can && /* @__PURE__ */ (0, H.jsx)(h, {
					onClick: () => n({
						type: "annual",
						from_day: e.today,
						to_day: e.today,
						approved: !0
					}),
					children: "➕ Add leave"
				}), /* @__PURE__ */ (0, H.jsxs)("span", {
					className: "text-sm text-muted-foreground",
					children: [
						"Annual leave: ",
						d,
						" days a year each (Settings)."
					]
				})]
			}),
			/* @__PURE__ */ (0, H.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, H.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, H.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, H.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Type"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Dates"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2 text-right",
								children: "Days"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Reason"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Annual left"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, H.jsx)("th", { className: "p-2" })
						] })
					}), /* @__PURE__ */ (0, H.jsx)("tbody", { children: f.map((t) => /* @__PURE__ */ (0, H.jsxs)("tr", {
						className: v("border-t", t.status === "pending" && "bg-amber-50 dark:bg-amber-950/30"),
						children: [
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2",
								children: a(t.staff_id)
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2",
								children: t.type
							}),
							/* @__PURE__ */ (0, H.jsxs)("td", {
								className: "p-2 whitespace-nowrap",
								children: [G(t.from_day), t.to_day === t.from_day ? "" : ` – ${G(t.to_day)}`]
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2 text-right",
								children: t.days
							}),
							/* @__PURE__ */ (0, H.jsxs)("td", {
								className: "p-2",
								children: [
									t.reason,
									t.has_photo ? /* @__PURE__ */ (0, H.jsx)("button", {
										type: "button",
										className: "ml-1 text-primary underline",
										onClick: async () => i((await e.api("GET", `/api/hr/leaves/${t.id}/photo`)).photo),
										children: "📎 note"
									}) : null,
									/* @__PURE__ */ (0, H.jsx)("small", {
										className: "block text-muted-foreground",
										children: t.via === "worker" ? "asked on the check-in page" : "entered by a manager"
									})
								]
							}),
							/* @__PURE__ */ (0, H.jsx)("td", {
								className: "p-2",
								children: d - B(e.leaves, t.staff_id, l)
							}),
							/* @__PURE__ */ (0, H.jsxs)("td", {
								className: "p-2",
								children: [/* @__PURE__ */ (0, H.jsx)(b, {
									variant: t.status === "approved" ? "default" : "outline",
									children: t.status
								}), t.decided_by && /* @__PURE__ */ (0, H.jsx)("small", {
									className: "block text-muted-foreground",
									children: t.decided_by
								})]
							}),
							/* @__PURE__ */ (0, H.jsxs)("td", {
								className: "p-2 whitespace-nowrap",
								children: [e.can && t.status === "pending" && /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [
									/* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										onClick: () => void p(t, "approved"),
										children: "✔ Approve"
									}),
									" ",
									/* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => void p(t, "rejected"),
										children: "✖ Refuse"
									})
								] }), e.can && t.status === "approved" && /* @__PURE__ */ (0, H.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: () => void p(t, "cancelled"),
									children: "Cancel"
								})]
							})
						]
					}, t.id)) })]
				})
			}),
			t && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => n(null),
				children: /* @__PURE__ */ (0, H.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, H.jsx)(o, { children: /* @__PURE__ */ (0, H.jsx)(c, { children: "Add leave" }) }),
						/* @__PURE__ */ (0, H.jsxs)("select", {
							className: K,
							value: t.staff_id ?? "",
							onChange: (e) => n({
								...t,
								staff_id: Number(e.target.value)
							}),
							children: [/* @__PURE__ */ (0, H.jsx)("option", {
								value: "",
								children: "Person…"
							}), e.active.map((e) => /* @__PURE__ */ (0, H.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						}),
						/* @__PURE__ */ (0, H.jsx)("select", {
							className: K,
							value: t.type,
							onChange: (e) => n({
								...t,
								type: e.target.value
							}),
							children: [
								"annual",
								"sick",
								"emergency",
								"unpaid",
								"other"
							].map((e) => /* @__PURE__ */ (0, H.jsx)("option", { children: e }, e))
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, H.jsx)(_, {
								type: "date",
								value: t.from_day,
								onChange: (e) => n({
									...t,
									from_day: e.target.value
								})
							}), /* @__PURE__ */ (0, H.jsx)(_, {
								type: "date",
								value: t.to_day,
								onChange: (e) => n({
									...t,
									to_day: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							placeholder: "Reason",
							value: t.reason ?? "",
							onChange: (e) => n({
								...t,
								reason: e.target.value
							})
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, H.jsx)("input", {
								type: "checkbox",
								checked: !!t.approved,
								onChange: (e) => n({
									...t,
									approved: e.target.checked
								})
							}), "Approved"]
						}),
						t.err && /* @__PURE__ */ (0, H.jsx)("p", {
							className: "text-sm text-destructive",
							children: t.err
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							onClick: async () => {
								try {
									await e.api("POST", "/api/hr/leaves", {
										site: e.siteId,
										...t
									}), n(null), await e.reload();
								} catch (e) {
									n({
										...t,
										err: e.message
									});
								}
							},
							children: "Save"
						})
					]
				})
			}),
			r && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, H.jsx)(s, { children: /* @__PURE__ */ (0, H.jsx)("img", {
					src: r,
					alt: "Note",
					className: "w-full rounded-xl"
				}) })
			})
		]
	});
}
function Q(e) {
	let [t, n] = (0, S.useState)(e.today), [r, i] = (0, S.useState)(null), [a, o] = (0, S.useState)(null), [c, l] = (0, S.useState)(!1), d = (e) => {
		l(!1), i({
			day: t,
			days: [t],
			staff_ids: [],
			priority: e.priority,
			checklist: e.steps,
			title: e.title,
			title_local: e.bn,
			place: e.place,
			minutes: e.minutes,
			need_photo: e.photo,
			details: `How often: ${e.freq}`
		});
	}, f = e.tasks.filter((e) => e.day === t), p = (t) => e.staff.find((e) => e.id === t)?.name || "?", m = async (t, n) => {
		await e.api("PUT", `/api/hr/tasks/${t.id}`, { action: n }), await e.reload();
	}, y = [
		["open", "To do"],
		["started", "Started"],
		["done", "Done — check it"],
		["verified", "Checked ✔"]
	], b = (e) => e.started_at && e.done_at ? Math.round((Date.parse(e.done_at + ":00Z") - Date.parse(e.started_at + ":00Z")) / 6e4) : null;
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => n(A(t, -1)),
						children: "◀"
					}),
					/* @__PURE__ */ (0, H.jsx)(_, {
						type: "date",
						className: "w-44",
						value: t,
						onChange: (e) => n(e.target.value || t)
					}),
					/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => n(A(t, 1)),
						children: "▶"
					}),
					e.can && /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [/* @__PURE__ */ (0, H.jsx)(h, {
						className: "ml-auto",
						variant: "outline",
						onClick: () => l(!0),
						children: "📚 From the library"
					}), /* @__PURE__ */ (0, H.jsx)(h, {
						onClick: () => i({
							day: t,
							days: [t],
							staff_ids: [],
							priority: "normal",
							checklist: []
						}),
						children: "➕ New task"
					})] })
				]
			}),
			/* @__PURE__ */ (0, H.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-4",
				children: y.map(([t, n]) => /* @__PURE__ */ (0, H.jsxs)(g, {
					className: "content-start gap-2 bg-muted/30 p-2",
					children: [/* @__PURE__ */ (0, H.jsxs)("b", {
						className: "px-1 text-sm",
						children: [
							n,
							" (",
							f.filter((e) => e.status === t).length,
							")"
						]
					}), f.filter((e) => e.status === t).map((t) => /* @__PURE__ */ (0, H.jsxs)("div", {
						className: v("grid gap-1 rounded-lg border bg-card p-2 text-sm", t.priority === "high" && "border-red-300"),
						children: [
							/* @__PURE__ */ (0, H.jsx)("b", { children: t.title }),
							t.title_local && /* @__PURE__ */ (0, H.jsx)("span", {
								className: "text-muted-foreground",
								children: t.title_local
							}),
							/* @__PURE__ */ (0, H.jsx)("small", {
								className: "text-muted-foreground",
								children: [
									t.place && "📍 " + t.place,
									t.due && "⏰ " + t.due,
									t.minutes && `⌛ ${t.minutes} min`
								].filter(Boolean).join(" · ")
							}),
							/* @__PURE__ */ (0, H.jsxs)("small", { children: ["👷 ", t.staff_ids.map(p).join(", ") || "—"] }),
							(t.started_at || t.done_at) && /* @__PURE__ */ (0, H.jsxs)("small", {
								className: "text-muted-foreground",
								children: [
									t.started_at ? `started ${t.started_at.slice(11)}` : "",
									t.done_at ? ` · done ${t.done_at.slice(11)}` : "",
									b(t) == null ? "" : ` · took ${b(t)} min${t.minutes && b(t) > t.minutes ? " ⚠" : ""}`
								]
							}),
							t.note && /* @__PURE__ */ (0, H.jsxs)("small", {
								className: "text-red-700",
								children: ["💬 ", t.note]
							}),
							/* @__PURE__ */ (0, H.jsxs)("span", {
								className: "flex flex-wrap gap-1",
								children: [
									t.has_photo ? /* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: async () => o((await e.api("GET", `/api/hr/tasks/${t.id}/photo`)).photo),
										children: "📷 photo"
									}) : null,
									e.can && t.status === "done" && /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [/* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										onClick: () => void m(t, "verify"),
										children: "✔ OK"
									}), /* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => void m(t, "redo"),
										children: "↺ Redo"
									})] }),
									e.can && /* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "ghost",
										onClick: () => i({
											...t,
											days: [t.day]
										}),
										children: "✏️"
									}),
									e.can && /* @__PURE__ */ (0, H.jsx)(h, {
										size: "sm",
										variant: "ghost",
										className: "text-destructive",
										onClick: async () => {
											await e.confirm({
												title: "Delete this task?",
												confirmLabel: "Delete"
											}) && (await e.api("DELETE", `/api/hr/tasks/${t.id}`), await e.reload());
										},
										children: "🗑"
									})
								]
							})
						]
					}, t.id))]
				}, t))
			}),
			r && /* @__PURE__ */ (0, H.jsx)(ce, {
				c: e,
				t: r,
				onClose: () => i(null)
			}),
			c && /* @__PURE__ */ (0, H.jsx)(fe, {
				onPick: d,
				onClose: () => l(!1)
			}),
			a && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => o(null),
				children: /* @__PURE__ */ (0, H.jsx)(s, { children: /* @__PURE__ */ (0, H.jsx)("img", {
					src: a,
					alt: "Proof",
					className: "w-full rounded-xl"
				}) })
			})
		]
	});
}
function ce({ c: e, t, onClose: n }) {
	let [r, i] = (0, S.useState)({
		...t,
		checklistText: (t.checklist || []).join("\n"),
		repeatTo: ""
	}), [a, d] = (0, S.useState)(""), f = (e, t) => i((n) => ({
		...n,
		[e]: t
	})), p = (t) => e.roles.find((e) => e.id === t);
	async function m() {
		let t = r.id ? [r.day] : r.repeatTo && r.repeatTo > r.day ? j(r.day, r.repeatTo) : [r.day], i = {
			site: e.siteId,
			...r,
			days: t,
			checklist: String(r.checklistText || "").split("\n").map((e) => e.trim()).filter(Boolean)
		};
		try {
			r.id ? await e.api("PUT", `/api/hr/tasks/${r.id}`, i) : await e.api("POST", "/api/hr/tasks", i), await e.reload(), n();
		} catch (e) {
			d(e.message);
		}
	}
	return /* @__PURE__ */ (0, H.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, H.jsxs)(s, {
			className: "max-h-[90vh] max-w-xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsx)(c, { children: r.id ? "Edit task" : "New task" }), /* @__PURE__ */ (0, H.jsx)(l, { children: "Write it short. Add the Bangla words if you can — the check-in page shows them first." })] }),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, H.jsx)(_, {
							placeholder: "Task (English), e.g. Clean the 7th floor corridor",
							value: r.title ?? "",
							onChange: (e) => f("title", e.target.value)
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							placeholder: "Task (Bangla)",
							value: r.title_local ?? "",
							onChange: (e) => f("title_local", e.target.value)
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, H.jsx)(_, {
								placeholder: "Where (📍 place)",
								value: r.place ?? "",
								onChange: (e) => f("place", e.target.value)
							}), /* @__PURE__ */ (0, H.jsx)(_, {
								type: "time",
								value: r.due ?? "",
								onChange: (e) => f("due", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Day", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "date",
										value: r.day,
										onChange: (e) => f("day", e.target.value)
									})]
								}),
								!r.id && /* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Repeat daily until", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "date",
										value: r.repeatTo,
										onChange: (e) => f("repeatTo", e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Minutes it should take", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "number",
										min: 0,
										value: r.minutes ?? "",
										onChange: (e) => f("minutes", Number(e.target.value))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "flex flex-wrap gap-3 text-sm",
							children: [/* @__PURE__ */ (0, H.jsxs)("select", {
								className: K,
								value: r.priority,
								onChange: (e) => f("priority", e.target.value),
								children: [
									/* @__PURE__ */ (0, H.jsx)("option", {
										value: "high",
										children: "⚠ Urgent"
									}),
									/* @__PURE__ */ (0, H.jsx)("option", {
										value: "normal",
										children: "Normal"
									}),
									/* @__PURE__ */ (0, H.jsx)("option", {
										value: "low",
										children: "Low"
									})
								]
							}), /* @__PURE__ */ (0, H.jsxs)("label", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, H.jsx)("input", {
									type: "checkbox",
									checked: !!r.need_photo,
									onChange: (e) => f("need_photo", e.target.checked)
								}), "📷 Photo when done"]
							})]
						}),
						/* @__PURE__ */ (0, H.jsx)(x, {
							placeholder: "Details",
							value: r.details ?? "",
							onChange: (e) => f("details", e.target.value)
						}),
						/* @__PURE__ */ (0, H.jsx)(x, {
							placeholder: "Checklist — one step a line",
							value: r.checklistText,
							onChange: (e) => f("checklistText", e.target.value)
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, H.jsx)("b", {
								className: "text-xs",
								children: "Who does it"
							}), /* @__PURE__ */ (0, H.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: e.active.map((e) => {
									let t = r.staff_ids.includes(e.id);
									return /* @__PURE__ */ (0, H.jsxs)("button", {
										type: "button",
										onClick: () => f("staff_ids", t ? r.staff_ids.filter((t) => t !== e.id) : [...r.staff_ids, e.id]),
										className: v("flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs", t && "border-primary bg-primary/10 font-semibold"),
										children: [
											/* @__PURE__ */ (0, H.jsx)(J, {
												s: e,
												cls: "size-5"
											}),
											e.name,
											p(e.role_id) ? ` · ${p(e.role_id).title}` : ""
										]
									}, e.id);
								})
							})]
						}),
						!r.id && e.roles.length > 0 && /* @__PURE__ */ (0, H.jsxs)("div", {
							className: "text-xs",
							children: [
								/* @__PURE__ */ (0, H.jsx)("b", { children: "From a job role's duties:" }),
								" ",
								e.roles.map((e) => /* @__PURE__ */ (0, H.jsx)("button", {
									type: "button",
									className: "ml-1 text-primary underline",
									onClick: () => f("checklistText", (e.duties || []).join("\n")),
									children: e.title
								}, e.id))
							]
						})
					]
				}),
				a && /* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-sm text-destructive",
					children: a
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: n,
						children: "Cancel"
					}), /* @__PURE__ */ (0, H.jsx)(h, {
						onClick: () => void m(),
						children: "Save"
					})]
				})
			]
		})
	});
}
function le(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), [a, l] = (0, S.useState)(!1), d = async () => {
		let r = t.id ? await e.api("PUT", `/api/hr/shifts/${t.id}`, t) : await e.api("POST", "/api/hr/shifts", {
			site: e.siteId,
			...t
		});
		e.setD({
			...e.D,
			...r
		}), n(null);
	}, f = async () => {
		let t = {
			...r,
			duties: String(r.dutiesText || "").split("\n").map((e) => e.trim()).filter(Boolean)
		}, n = r.id ? await e.api("PUT", `/api/hr/roles/${r.id}`, t) : await e.api("POST", "/api/hr/roles", {
			site: e.siteId,
			...t
		});
		e.setD({
			...e.D,
			...n
		}), i(null);
	};
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, H.jsxs)(g, {
				className: "content-start gap-2 p-4",
				children: [
					/* @__PURE__ */ (0, H.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, H.jsx)("h2", {
							className: "font-bold",
							children: "Shifts"
						}), e.can && /* @__PURE__ */ (0, H.jsx)(h, {
							size: "sm",
							onClick: () => n({
								name: "Morning",
								start: "07:00",
								end: "15:00",
								break_min: 60,
								grace_min: 10,
								days: [
									0,
									1,
									2,
									3,
									4,
									6
								],
								color: "#2563eb"
							}),
							children: "➕ Shift"
						})]
					}),
					e.shifts.map((t) => /* @__PURE__ */ (0, H.jsxs)("div", {
						className: "flex items-center gap-2 rounded-lg border p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, H.jsx)("span", {
								className: "size-4 rounded",
								style: { background: t.color }
							}),
							/* @__PURE__ */ (0, H.jsx)("b", { children: t.name }),
							/* @__PURE__ */ (0, H.jsxs)("span", { children: [
								t.start,
								"–",
								t.end
							] }),
							/* @__PURE__ */ (0, H.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"break ",
									t.break_min,
									" · grace ",
									t.grace_min,
									" min · ",
									t.days.map((e) => W[e]).join(" ")
								]
							}),
							e.can && /* @__PURE__ */ (0, H.jsxs)("span", {
								className: "ml-auto flex gap-1",
								children: [/* @__PURE__ */ (0, H.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: () => n(t),
									children: "✏️"
								}), /* @__PURE__ */ (0, H.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: async () => e.setD({
										...e.D,
										...await e.api("DELETE", `/api/hr/shifts/${t.id}`)
									}),
									children: "🗑"
								})]
							})
						]
					}, t.id)),
					!e.shifts.length && /* @__PURE__ */ (0, H.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No shifts yet."
					})
				]
			}),
			/* @__PURE__ */ (0, H.jsxs)(g, {
				className: "content-start gap-2 p-4",
				children: [
					/* @__PURE__ */ (0, H.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, H.jsx)("h2", {
							className: "font-bold",
							children: "Job roles and their duties"
						}), e.can && /* @__PURE__ */ (0, H.jsxs)("span", {
							className: "flex gap-1",
							children: [/* @__PURE__ */ (0, H.jsx)(h, {
								size: "sm",
								variant: "outline",
								onClick: () => l(!0),
								children: "📚 Add from the library"
							}), /* @__PURE__ */ (0, H.jsx)(h, {
								size: "sm",
								onClick: () => i({
									title: "",
									duties: [],
									dutiesText: ""
								}),
								children: "➕ Role"
							})]
						})]
					}),
					e.roles.map((t) => /* @__PURE__ */ (0, H.jsxs)("div", {
						className: "grid gap-1 rounded-lg border p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, H.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, H.jsx)("b", { children: t.title }),
									t.title_local && /* @__PURE__ */ (0, H.jsx)("span", {
										className: "text-muted-foreground",
										children: t.title_local
									}),
									e.can && /* @__PURE__ */ (0, H.jsxs)("span", {
										className: "ml-auto flex gap-1",
										children: [/* @__PURE__ */ (0, H.jsx)(h, {
											size: "sm",
											variant: "ghost",
											onClick: () => i({
												...t,
												dutiesText: (t.duties || []).join("\n")
											}),
											children: "✏️"
										}), /* @__PURE__ */ (0, H.jsx)(h, {
											size: "sm",
											variant: "ghost",
											onClick: async () => e.setD({
												...e.D,
												...await e.api("DELETE", `/api/hr/roles/${t.id}`)
											}),
											children: "🗑"
										})]
									})
								]
							}),
							(t.duties || []).length > 0 && /* @__PURE__ */ (0, H.jsx)("ul", {
								className: "list-disc pl-5 text-muted-foreground",
								children: t.duties.map((e, t) => /* @__PURE__ */ (0, H.jsx)("li", { children: e }, t))
							}),
							/* @__PURE__ */ (0, H.jsxs)("small", {
								className: "text-muted-foreground",
								children: [e.staff.filter((e) => e.role_id === t.id && e.active).length, " people"]
							})
						]
					}, t.id)),
					!e.roles.length && /* @__PURE__ */ (0, H.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "E.g. Room cleaner, Laundry, Kitchen helper, Driver, Security — each with its daily duties (they become task checklists)."
					})
				]
			}),
			t && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => n(null),
				children: /* @__PURE__ */ (0, H.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, H.jsx)(o, { children: /* @__PURE__ */ (0, H.jsx)(c, { children: "Shift" }) }),
						/* @__PURE__ */ (0, H.jsx)(_, {
							value: t.name,
							onChange: (e) => n({
								...t,
								name: e.target.value
							}),
							placeholder: "Name"
						}),
						/* @__PURE__ */ (0, H.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Start", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "time",
										value: t.start,
										onChange: (e) => n({
											...t,
											start: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["End", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "time",
										value: t.end,
										onChange: (e) => n({
											...t,
											end: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Break (min)", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "number",
										value: t.break_min,
										onChange: (e) => n({
											...t,
											break_min: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, H.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Grace before “late” (min)", /* @__PURE__ */ (0, H.jsx)(_, {
										type: "number",
										value: t.grace_min,
										onChange: (e) => n({
											...t,
											grace_min: Number(e.target.value)
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, H.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: W.map((e, r) => /* @__PURE__ */ (0, H.jsx)("button", {
								type: "button",
								className: v("rounded border px-2 py-1 text-xs", t.days.includes(r) && "border-primary bg-primary/10 font-bold"),
								onClick: () => n({
									...t,
									days: t.days.includes(r) ? t.days.filter((e) => e !== r) : [...t.days, r]
								}),
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: ["Colour ", /* @__PURE__ */ (0, H.jsx)("input", {
								type: "color",
								value: t.color,
								onChange: (e) => n({
									...t,
									color: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							onClick: () => void d(),
							children: "Save"
						})
					]
				})
			}),
			r && /* @__PURE__ */ (0, H.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, H.jsxs)(s, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, H.jsx)(o, { children: /* @__PURE__ */ (0, H.jsx)(c, { children: "Job role" }) }),
						/* @__PURE__ */ (0, H.jsx)(_, {
							value: r.title,
							onChange: (e) => i({
								...r,
								title: e.target.value
							}),
							placeholder: "Title, e.g. Room cleaner"
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							value: r.title_local ?? "",
							onChange: (e) => i({
								...r,
								title_local: e.target.value
							}),
							placeholder: "Title (Bangla)"
						}),
						/* @__PURE__ */ (0, H.jsx)(x, {
							className: "min-h-40",
							value: r.dutiesText,
							onChange: (e) => i({
								...r,
								dutiesText: e.target.value
							}),
							placeholder: "Duties — one a line, e.g.\nMake the beds\nEmpty the bins\nClean the bathroom"
						}),
						/* @__PURE__ */ (0, H.jsx)(_, {
							value: r.skills ?? "",
							onChange: (e) => i({
								...r,
								skills: e.target.value
							}),
							placeholder: "Skills needed"
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							onClick: () => void f(),
							children: "Save"
						})
					]
				})
			}),
			a && /* @__PURE__ */ (0, H.jsx)(de, {
				c: e,
				onClose: () => l(!1)
			})
		]
	});
}
function ue(e) {
	let t = e.D.settings, [n, r] = (0, S.useState)({
		lat: t.geo.lat ?? "",
		lng: t.geo.lng ?? "",
		radius: t.geo.radius ?? 200,
		code: t.geo.code ?? "",
		faceMax: t.faceMax,
		annualDays: t.annualDays,
		otRate: t.otRate
	}), [i, a] = (0, S.useState)(""), o = async () => {
		try {
			e.setD({
				...e.D,
				...await e.api("PUT", "/api/hr/settings", {
					site: e.siteId,
					geo: {
						lat: n.lat,
						lng: n.lng,
						radius: n.radius,
						code: n.code
					},
					faceMax: n.faceMax,
					annualDays: n.annualDays,
					otRate: n.otRate
				})
			}), a("Saved.");
		} catch (e) {
			a(e.message);
		}
	};
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, H.jsxs)(g, {
			className: "content-start gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, H.jsx)("h2", {
					className: "font-bold",
					children: "📍 Workplace circle (geofence)"
				}),
				/* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Check-in works only within this distance of the point. Phones' GPS is usually right to 5–20 m outdoors, worse indoors — 200 m is a safe circle for a building."
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Latitude", /* @__PURE__ */ (0, H.jsx)(_, {
								value: n.lat,
								onChange: (e) => r({
									...n,
									lat: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Longitude", /* @__PURE__ */ (0, H.jsx)(_, {
								value: n.lng,
								onChange: (e) => r({
									...n,
									lng: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Radius (m)", /* @__PURE__ */ (0, H.jsx)(_, {
								type: "number",
								value: n.radius,
								onChange: (e) => r({
									...n,
									radius: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Plus code / note", /* @__PURE__ */ (0, H.jsx)(_, {
								value: n.code,
								onChange: (e) => r({
									...n,
									code: e.target.value
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, H.jsx)(h, {
						variant: "outline",
						onClick: () => navigator.geolocation.getCurrentPosition((e) => r((t) => ({
							...t,
							lat: Number(e.coords.latitude.toFixed(6)),
							lng: Number(e.coords.longitude.toFixed(6))
						})), (e) => a(e.message), { enableHighAccuracy: !0 }),
						children: "📍 Use where I am now"
					}), n.lat && n.lng && /* @__PURE__ */ (0, H.jsx)("a", {
						className: "text-sm text-primary underline",
						href: `https://www.google.com/maps?q=${n.lat},${n.lng}`,
						target: "_blank",
						rel: "noopener",
						children: "Check on the map ↗"
					})]
				}),
				/* @__PURE__ */ (0, H.jsx)("h2", {
					className: "mt-2 font-bold",
					children: "Rules"
				}),
				/* @__PURE__ */ (0, H.jsxs)("label", {
					className: "grid gap-1 text-xs font-semibold",
					children: ["Face match strictness (lower = stricter; 0.5 is standard)", /* @__PURE__ */ (0, H.jsx)(_, {
						type: "number",
						step: .01,
						min: .35,
						max: .65,
						value: n.faceMax,
						onChange: (e) => r({
							...n,
							faceMax: Number(e.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, H.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Annual leave days a year", /* @__PURE__ */ (0, H.jsx)(_, {
							type: "number",
							value: n.annualDays,
							onChange: (e) => r({
								...n,
								annualDays: Number(e.target.value)
							})
						})]
					}), /* @__PURE__ */ (0, H.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Overtime pay rate (× hourly)", /* @__PURE__ */ (0, H.jsx)(_, {
							type: "number",
							step: .25,
							value: n.otRate,
							onChange: (e) => r({
								...n,
								otRate: Number(e.target.value)
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Saudi Labour Law: at least 21 days' annual leave (30 after 5 years), overtime paid at the hourly wage plus 50% (×1.5), normally up to 8 hours a day / 48 a week."
				}),
				e.can && /* @__PURE__ */ (0, H.jsx)(h, {
					onClick: () => void o(),
					children: "Save settings"
				}),
				/* @__PURE__ */ (0, H.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: i
				})
			]
		}), /* @__PURE__ */ (0, H.jsxs)(g, {
			className: "content-start gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, H.jsx)("h2", {
					className: "font-bold",
					children: "📱 The check-in page"
				}),
				/* @__PURE__ */ (0, H.jsx)($, {
					siteId: e.siteId,
					big: !0
				}),
				/* @__PURE__ */ (0, H.jsxs)("ol", {
					className: "list-decimal space-y-1 pl-5 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, H.jsxs)("li", { children: [
							"Add each person on Staff, take their photo and ",
							/* @__PURE__ */ (0, H.jsx)("b", { children: "Enroll face" }),
							" (in person, good light)."
						] }),
						/* @__PURE__ */ (0, H.jsxs)("li", { children: [
							"Press ",
							/* @__PURE__ */ (0, H.jsx)("b", { children: "Give PIN" }),
							" and print their card."
						] }),
						/* @__PURE__ */ (0, H.jsx)("li", { children: "Put the QR poster at the staff entrance. They open it on their own phone (or a phone at the gate), type the PIN, look and blink." }),
						/* @__PURE__ */ (0, H.jsx)("li", { children: "Refused attempts (wrong face, no blink, outside the circle) are kept with the selfie on Attendance." })
					]
				}),
				/* @__PURE__ */ (0, H.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Faces and selfies are personal data: tell staff what is taken and why (attendance only), keep it to that, and remove people when they leave."
				})
			]
		})]
	});
}
function $({ siteId: e, big: t }) {
	let n = new URL(`hr/?site=${e}`, location.href.split("#")[0]).href, [r, i] = (0, S.useState)("");
	return (0, S.useEffect)(() => {
		if (!t) return;
		let e = () => {
			let e = window.qrcode(0, "M");
			e.addData(n), e.make(), i(e.createSvgTag({
				cellSize: 6,
				margin: 2
			}));
		};
		if (window.qrcode) e();
		else {
			let t = document.createElement("script");
			t.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js", t.onload = e, document.head.appendChild(t);
		}
	}, [t, n]), t ? /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "grid justify-items-start gap-2",
		children: [
			/* @__PURE__ */ (0, H.jsx)("a", {
				className: "break-all text-sm text-primary underline",
				href: n,
				target: "_blank",
				rel: "noopener",
				children: n
			}),
			/* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, H.jsx)(h, {
					size: "sm",
					variant: "outline",
					onClick: () => void navigator.clipboard.writeText(n),
					children: "Copy link"
				}), r && /* @__PURE__ */ (0, H.jsx)(h, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						let e = window.open("", "_blank");
						e && (e.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:40px"><h1 style="font-size:48px;margin:0">হাজিরা · Attendance</h1><p style="font-size:24px">ফোনের ক্যামেরা দিয়ে স্ক্যান করুন<br>Scan with your phone camera</p><div style="display:inline-block;transform:scale(1.6);margin:60px">${r}</div><p style="font-size:22px">১. আপনার নম্বর দিন · Type your number<br>২. ক্যামেরার দিকে তাকান, পলক ফেলুন · Look and blink<br>৩. কাজের তালিকা দেখুন · See your tasks</p><p style="font-size:14px;color:#555">${n}</p><script>setTimeout(()=>print(),400)<\/script></body></html>`), e.document.close());
					},
					children: "🖨 Print QR poster"
				})]
			}),
			r && /* @__PURE__ */ (0, H.jsx)("div", {
				className: "rounded-xl bg-white p-2",
				dangerouslySetInnerHTML: { __html: r }
			})
		]
	}) : /* @__PURE__ */ (0, H.jsx)("a", {
		className: "rounded-lg border bg-card px-3 py-2 text-sm font-semibold hover:border-gold",
		href: n,
		target: "_blank",
		rel: "noopener",
		children: "📱 Staff check-in page ↗"
	});
}
function de({ c: e, onClose: t }) {
	let n = new Set(e.roles.map((e) => String(e.title).toLowerCase())), [r, i] = (0, S.useState)(() => new Set(T.filter((e) => !n.has(e.title.toLowerCase())).map((e) => e.title))), [a, d] = (0, S.useState)(""), [f, p] = (0, S.useState)(""), m = (e, t) => i((n) => {
		let r = new Set(n);
		return e.forEach((e) => t ? r.add(e) : r.delete(e)), r;
	});
	async function g() {
		let i = T.filter((e) => r.has(e.title) && !n.has(e.title.toLowerCase())), a = e.D;
		for (let t = 0; t < i.length; t++) {
			let n = i[t];
			d(`Adding ${t + 1} of ${i.length}…`), a = {
				...a,
				...await e.api("POST", "/api/hr/roles", {
					site: e.siteId,
					title: n.title,
					title_local: n.bn,
					duties: n.duties,
					skills: n.skills
				})
			};
		}
		e.setD(a), t();
	}
	let y = T.filter((e) => !f || (e.title + e.bn + e.duties.join(" ")).toLowerCase().includes(f.toLowerCase())), b = (e) => e.filter((e) => !n.has(e.title.toLowerCase()));
	return /* @__PURE__ */ (0, H.jsx)(u, {
		open: !0,
		onOpenChange: t,
		children: /* @__PURE__ */ (0, H.jsxs)(s, {
			className: "max-h-[90vh] max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsx)(c, { children: "📚 Job roles from the hotel library" }), /* @__PURE__ */ (0, H.jsxs)(l, { children: [
					T.length,
					" roles across ",
					C.length,
					" departments, each with its duties step by step. Roles you already have are greyed out."
				] })] }),
				/* @__PURE__ */ (0, H.jsx)(_, {
					placeholder: "Search…",
					value: f,
					onChange: (e) => p(e.target.value)
				}),
				C.map(([e, t, i]) => {
					let a = y.filter((t) => t.dept === e);
					if (!a.length) return null;
					let o = b(a).length > 0 && b(a).every((e) => r.has(e.title));
					return /* @__PURE__ */ (0, H.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, H.jsxs)("label", {
							className: "flex items-center gap-2 text-sm font-bold",
							children: [
								/* @__PURE__ */ (0, H.jsx)("input", {
									type: "checkbox",
									checked: o,
									onChange: (e) => m(b(a).map((e) => e.title), e.target.checked)
								}),
								t,
								" ",
								/* @__PURE__ */ (0, H.jsx)("span", {
									className: "font-normal text-muted-foreground",
									children: i
								})
							]
						}), a.map((e) => {
							let t = n.has(e.title.toLowerCase());
							return /* @__PURE__ */ (0, H.jsxs)("label", {
								className: v("ml-6 flex items-start gap-2 rounded border p-1.5 text-sm", t && "opacity-50"),
								children: [/* @__PURE__ */ (0, H.jsx)("input", {
									type: "checkbox",
									className: "mt-1",
									disabled: t,
									checked: t || r.has(e.title),
									onChange: (t) => m([e.title], t.target.checked)
								}), /* @__PURE__ */ (0, H.jsxs)("span", { children: [
									/* @__PURE__ */ (0, H.jsx)("b", { children: e.title }),
									" ",
									/* @__PURE__ */ (0, H.jsx)("span", {
										className: "text-muted-foreground",
										children: e.bn
									}),
									t && " · already added",
									/* @__PURE__ */ (0, H.jsx)("br", {}),
									/* @__PURE__ */ (0, H.jsxs)("small", {
										className: "text-muted-foreground",
										children: [
											e.duties.length,
											" duties · ",
											e.skills
										]
									})
								] })]
							}, e.title);
						})]
					}, e);
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "sticky bottom-0 flex items-center justify-end gap-2 bg-background pt-2",
					children: [
						/* @__PURE__ */ (0, H.jsx)("span", {
							className: "mr-auto text-sm text-muted-foreground",
							children: a || `${[...r].filter((e) => !n.has(e.toLowerCase())).length} selected`
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							variant: "outline",
							onClick: t,
							children: "Cancel"
						}),
						/* @__PURE__ */ (0, H.jsx)(h, {
							disabled: !!a,
							onClick: () => void g().catch((e) => d(e.message)),
							children: "Add the selected roles"
						})
					]
				})
			]
		})
	});
}
function fe({ onPick: e, onClose: t }) {
	let [n, r] = (0, S.useState)(""), [i, a] = (0, S.useState)(""), d = D.filter((e) => (!n || e.dept === n) && (!i || (e.title + e.bn + e.place + e.steps.join(" ")).toLowerCase().includes(i.toLowerCase()))), f = (e) => v("rounded-full border px-2 py-0.5 text-xs", e && "border-primary bg-primary/10 font-bold");
	return /* @__PURE__ */ (0, H.jsx)(u, {
		open: !0,
		onOpenChange: t,
		children: /* @__PURE__ */ (0, H.jsxs)(s, {
			className: "max-h-[90vh] max-w-3xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, H.jsxs)(o, { children: [/* @__PURE__ */ (0, H.jsx)(c, { children: "📚 Tasks from the hotel library" }), /* @__PURE__ */ (0, H.jsxs)(l, { children: [D.length, " ready tasks — front of house and the back-of-house jobs nobody notices. Pick one: it opens filled in (Bangla, place, minutes, checklist); choose who does it and save."] })] }),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [/* @__PURE__ */ (0, H.jsxs)("button", {
						type: "button",
						className: f(!n),
						onClick: () => r(""),
						children: [
							"All (",
							D.length,
							")"
						]
					}), C.map(([e, t]) => /* @__PURE__ */ (0, H.jsxs)("button", {
						type: "button",
						className: f(n === e),
						onClick: () => r(e),
						children: [
							t,
							" (",
							D.filter((t) => t.dept === e).length,
							")"
						]
					}, e))]
				}),
				/* @__PURE__ */ (0, H.jsx)(_, {
					placeholder: "Search, e.g. grease, tank, luggage, wudu…",
					value: i,
					onChange: (e) => a(e.target.value)
				}),
				/* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid gap-1.5 sm:grid-cols-2",
					children: [d.map((t) => /* @__PURE__ */ (0, H.jsxs)("button", {
						type: "button",
						onClick: () => e(t),
						className: v("grid gap-0.5 rounded-lg border p-2 text-left text-sm hover:bg-muted", t.priority === "high" && "border-red-300"),
						children: [
							/* @__PURE__ */ (0, H.jsxs)("b", { children: [t.priority === "high" ? "⚠ " : "", t.title] }),
							/* @__PURE__ */ (0, H.jsx)("span", {
								className: "text-muted-foreground",
								children: t.bn
							}),
							/* @__PURE__ */ (0, H.jsxs)("small", {
								className: "text-muted-foreground",
								children: [
									"📍 ",
									t.place,
									" · ⌛ ",
									t.minutes,
									" min · 🔁 ",
									t.freq,
									t.photo ? " · 📷" : "",
									" · ",
									t.steps.length,
									" steps"
								]
							})
						]
					}, t.dept + t.title)), !d.length && /* @__PURE__ */ (0, H.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Nothing matches."
					})]
				})
			]
		})
	});
}
export { te as default };
