export interface SubCountyRecord {
  id: string;
  name: string;
  county: string;
}

export interface WardRecord {
  id: string;
  name: string;
  subCountyName: string;
  county: string;
}

const STORAGE_PREFIX = 'erates_locations_v2_';

export const ALL_KENYA_COUNTIES_DATA: Record<string, Record<string, string[]>> = {
  "Mombasa": {
    "Changamwe": [
      "Port Reitz",
      "Kipevu",
      "Airport",
      "Changamwe",
      "Chaani"
    ],
    "Jomvu": [
      "Jomvu Kuu",
      "Miritini",
      "Mikindani"
    ],
    "Kisauni": [
      "Mjambere",
      "Junda",
      "Bamburi",
      "Mwakirunge",
      "Mtopanga",
      "Magogoni",
      "Shanzu"
    ],
    "Nyali": [
      "Frere Town",
      "Ziwa La Ng'ombe",
      "Mkomani",
      "Kongowea",
      "Kadzandani"
    ],
    "Likoni": [
      "Mtongwe",
      "Shika Adabu",
      "Bofu",
      "Likoni",
      "Timbwani"
    ],
    "Mvita": [
      "Mji wa Kale/Makadara",
      "Tudor",
      "Tononoka",
      "Shimanzi/Ganjoni",
      "Majengo"
    ]
  },
  "Kwale": {
    "Msambweni": [
      "Gombato Bongwe",
      "Ukunda",
      "Kinondo",
      "Ramisi"
    ],
    "Lungalunga": [
      "Pongwe/Kikoneni",
      "Dzombo",
      "Mwereni",
      "Vanga"
    ],
    "Matuga": [
      "Tsimba Golini",
      "Waa",
      "Tiwi",
      "Kubo South",
      "Mkongani"
    ],
    "Kinango": [
      "Ndavaya",
      "Puma",
      "Kinango",
      "Mackinnon Road",
      "Chengoni/Samburu",
      "Mwavumbo",
      "Kasemeni"
    ]
  },
  "Kilifi": {
    "Kilifi North": [
      "Tezo",
      "Sokoni",
      "Kibarani",
      "Dabaso",
      "Matsangoni",
      "Watamu",
      "Mnarani"
    ],
    "Kilifi South": [
      "Junju",
      "Mwarakaya",
      "Shimo la Tewa",
      "Chasimba",
      "Mtepeni"
    ],
    "Kaloleni": [
      "Mariakani",
      "Kayafungo",
      "Kaloleni",
      "Mwanamwinga"
    ],
    "Rabai": [
      "Mwawesa",
      "Ruruma",
      "Kambe/Ribe",
      "Rabai/Kisurutini"
    ],
    "Ganze": [
      "Ganze",
      "Bamba",
      "Jaribuni",
      "Sokoke"
    ],
    "Malindi": [
      "Jilore",
      "Kakuyuni",
      "Ganda",
      "Malindi Town",
      "Shella"
    ],
    "Magarini": [
      "Marafa",
      "Magarini",
      "Gongoni",
      "Adu",
      "Garashi",
      "Sabaki"
    ]
  },
  "Tana River": {
    "Garsen": [
      "Kipini East",
      "Garsen South",
      "Kipini West",
      "Garsen Central",
      "Garsen West",
      "Garsen North"
    ],
    "Galole": [
      "Kinakomba",
      "Mikinduni",
      "Chewani",
      "Wayu"
    ],
    "Bura": [
      "Chewele",
      "Hirimani",
      "Bangale",
      "Sala",
      "Madogo"
    ]
  },
  "Lamu": {
    "Lamu East": [
      "Faza",
      "Kiunga",
      "Basuba"
    ],
    "Lamu West": [
      "Shella",
      "Mkomani",
      "Hindi",
      "Mkunumbi",
      "Hongwe",
      "Witu",
      "Bahari"
    ]
  },
  "Taita-Taveta": {
    "Taveta": [
      "Chala",
      "Mahoo",
      "Bomani",
      "Mboghoni",
      "Mata"
    ],
    "Wundanyi": [
      "Wundanyi/Mbale",
      "Werugha",
      "Wumingu/Kishushe",
      "Mwanda/Mgange"
    ],
    "Mwatate": [
      "Rong'e",
      "Mwatate",
      "Bura",
      "Chawia",
      "Wusi/Kishamba"
    ],
    "Voi": [
      "Mbololo",
      "Sagalla",
      "Kaloleni",
      "Marungu",
      "Kasigau",
      "Ngolia"
    ]
  },
  "Garissa": {
    "Garissa Township": [
      "Waberi",
      "Galbet",
      "Township",
      "Iftin"
    ],
    "Balambala": [
      "Balambala",
      "Danyere",
      "Jarajara",
      "Sankuri",
      "Saka"
    ],
    "Lagdera": [
      "Modogashe",
      "Bename",
      "Goreale",
      "Maalamin",
      "Sabena",
      "Baraki"
    ],
    "Dadaab": [
      "Dertu",
      "Dadaab",
      "Labasigale",
      "Damajale",
      "Liboi",
      "Abakaile"
    ],
    "Fafi": [
      "Bura",
      "Dekaharia",
      "Jarajilla",
      "Fafi",
      "Nanighi"
    ],
    "Ijara": [
      "Hulugho",
      "Sangailu",
      "Ijara",
      "Masalani"
    ]
  },
  "Wajir": {
    "Wajir North": [
      "Gurar",
      "Bute",
      "Korondile",
      "Malkagufu",
      "Batalu",
      "Danaba",
      "Godoma"
    ],
    "Wajir East": [
      "Wagberi",
      "Township",
      "Barwaqo",
      "Khorof Harar"
    ],
    "Tarbaj": [
      "Elben",
      "Sarman",
      "Tarbaj",
      "Wargadud"
    ],
    "Wajir West": [
      "Arbajahan",
      "Hadado/Athibohol",
      "Ademasajida",
      "Ganyure/Wagalla"
    ],
    "Eldas": [
      "Eldas",
      "Ankambara",
      "Elkuro",
      "Basir",
      "Lakoley South/Basir"
    ],
    "Wajir South": [
      "Benane",
      "Burder",
      "Dadaja Bulla",
      "Habaswein",
      "Lagboghol South",
      "Ibrahim Ure",
      "Diif"
    ]
  },
  "Mandera": {
    "Mandera West": [
      "Takaba South",
      "Takaba",
      "Lagsure",
      "Dandu",
      "Gither"
    ],
    "Banissa": [
      "Banissa",
      "Derkhale",
      "Guba",
      "Malkamari",
      "Kiliwehiri"
    ],
    "Mandera North": [
      "Rhamu",
      "Rhamu Dimtu",
      "Ashabito",
      "Guticha",
      "Marothile"
    ],
    "Mandera South": [
      "Wargadud",
      "Kutulo",
      "Elwak South",
      "Elwak North",
      "Shimbir Fatuma"
    ],
    "Mandera East": [
      "Arabia",
      "Bulla Mpya",
      "Khalalio",
      "Neboi",
      "Township"
    ],
    "Lafey": [
      "Sala",
      "Fino",
      "Lafey",
      "Waranqara",
      "Alango Gof"
    ]
  },
  "Marsabit": {
    "Moyale": [
      "Butiye",
      "Sololo",
      "Heillu Manyatta",
      "Golbo",
      "Moyale Township",
      "Uran",
      "Obbu"
    ],
    "North Horr": [
      "Dukana",
      "Maikona",
      "Turbi",
      "North Horr",
      "Illeret"
    ],
    "Saku": [
      "Sagante/Jaldesa",
      "Karare",
      "Marsabit Central"
    ],
    "Laisamis": [
      "Loiyangalani",
      "Kargi/South Horr",
      "Korr/Ngurunit",
      "Logo Logo",
      "Laisamis"
    ]
  },
  "Isiolo": {
    "Isiolo": [
      "Wabera",
      "Bulla Pesa",
      "Chari",
      "Cherab",
      "Ngare Mara",
      "Burat",
      "Oldo/Nyiro"
    ],
    "Merti": [
      "Merti",
      "Bisan Biliqo",
      "Cherab"
    ],
    "Garbatulla": [
      "Garbatulla",
      "Kula Mawe",
      "Kinna",
      "Sericho"
    ]
  },
  "Meru": {
    "Igembe South": [
      "Maua",
      "Kegoi/Antubochiu",
      "Athiru Gaiti",
      "Akachiu",
      "Kanuni"
    ],
    "Igembe Central": [
      "Akirang'ondu",
      "Athiru Ruujine",
      "Igembe East",
      "Njia",
      "Kangeta"
    ],
    "Igembe North": [
      "Antuambui",
      "Ntunene",
      "Antubetwe Kiongo",
      "Naathu",
      "Amwathi"
    ],
    "Tigania West": [
      "Athwana",
      "Akithi",
      "Kianjai",
      "Nkomo",
      "Mbeu"
    ],
    "Tigania East": [
      "Thangatha",
      "Mikinduri",
      "Kiguchwa",
      "Muthara",
      "Karama"
    ],
    "North Imenti": [
      "Municipality",
      "Ntima East",
      "Ntima West",
      "Nyaki West",
      "Nyaki East"
    ],
    "Buuri": [
      "Timau",
      "Kisima",
      "Kiirua/Nkando",
      "Ruiri/Rwarera",
      "Kibirichia"
    ],
    "Central Imenti": [
      "Mwanganthia",
      "Abothuguchi Central",
      "Abothuguchi West",
      "Kiagu",
      "Kibirichia"
    ],
    "South Imenti": [
      "Mitianthuni",
      "Igoji East",
      "Igoji West",
      "Abogeta East",
      "Abogeta West",
      "Nkuene"
    ]
  },
  "Tharaka-Nithi": {
    "Maara": [
      "Mitheru",
      "Muthambi",
      "Mwimbi",
      "Ganga",
      "Chogoria"
    ],
    "Chuka/Igambang'ombe": [
      "Mariani",
      "Karingani",
      "Magumoni",
      "Mugwe",
      "Igambang'ombe"
    ],
    "Tharaka": [
      "Gatunga",
      "Mukothima",
      "Nkondi",
      "Chiakariga",
      "Marimanti"
    ]
  },
  "Embu": {
    "Manyatta": [
      "Ruguru/Ngandori",
      "Kithimu",
      "Nginda",
      "Mbeti North",
      "Kirimari",
      "Gaturi South"
    ],
    "Runyenjes": [
      "Gaturi North",
      "Kagaari South",
      "Kagaari North",
      "Central Ward",
      "Kyeni North",
      "Kyeni South"
    ],
    "Mbeere South": [
      "Mwea",
      "Makima",
      "Mbeti South",
      "Mavuria",
      "Kiambere"
    ],
    "Mbeere North": [
      "Nthawa",
      "Muminji",
      "Evurore"
    ]
  },
  "Kitui": {
    "Mwingi North": [
      "Ngomeni",
      "Kyuso",
      "Mumoni",
      "Tseikuru",
      "Tharaka"
    ],
    "Mwingi West": [
      "Kyome/Thaana",
      "Nguutani",
      "Migwani",
      "Kiomo/Kyethani"
    ],
    "Mwingi Central": [
      "Central",
      "Kivou",
      "Nguni",
      "Nuu",
      "Mui",
      "Waita"
    ],
    "Kitui West": [
      "Mutonguni",
      "Kauwi",
      "Matinyani",
      "Kwa Mutonga/Kithumula"
    ],
    "Kitui Rural": [
      "Kisasi",
      "Mbitini",
      "Kwavonza/Yatta",
      "Kanyangi"
    ],
    "Kitui Central": [
      "Miambani",
      "Township",
      "Kyangwithya West",
      "Mulango",
      "Kyangwithya East"
    ],
    "Kitui East": [
      "Zombe/Mwitika",
      "Chuluni",
      "Nzambani",
      "Voo/Kyamatu",
      "Endau/Malalani",
      "Mutito/Kaliku"
    ],
    "Kitui South": [
      "Ikanga/Kyatune",
      "Mutomo",
      "Mutha",
      "Ikutha",
      "Kanziko",
      "Athi"
    ]
  },
  "Machakos": {
    "Masinga": [
      "Kivaa",
      "Masinga Central",
      "Ekalakala",
      "Muthesya",
      "Ndithini"
    ],
    "Yatta": [
      "Ndalani",
      "Matuu",
      "Kithimani",
      "Ikombe",
      "Katangi"
    ],
    "Kangundo": [
      "Kangundo North",
      "Kangundo Central",
      "Kangundo East",
      "Kangundo West"
    ],
    "Matungulu": [
      "Tala",
      "Matungulu North",
      "Matungulu East",
      "Matungulu West",
      "Kyeleni"
    ],
    "Kathiani": [
      "Mitaboni",
      "Kathiani Central",
      "Upper Kaewa/Iveti",
      "Lower Kaewa/Kaani"
    ],
    "Mavoko": [
      "Athi River",
      "Kinanie",
      "Muthwani",
      "Syokimau/Mulolongo"
    ],
    "Machakos Town": [
      "Kalama",
      "Mua",
      "Mutituni",
      "Machakos Central",
      "Mumbuni North",
      "Muvuti/Kiima-Kimwe"
    ],
    "Mwala": [
      "Mbiuni",
      "Makutano/ Mwala",
      "Masii",
      "Muthetheni",
      "Wamunyu",
      "Kibauni"
    ]
  },
  "Makueni": {
    "Mbooni": [
      "Tulimani",
      "Mbooni",
      "Kithungo/Kitundu",
      "Kiteta/Kisau",
      "Waia-Kako",
      "Kalawa"
    ],
    "Kilome": [
      "Kasikeu",
      "Mukaa",
      "Kiima Kiu/Kalanzoni"
    ],
    "Kaiti": [
      "Ukia",
      "Kee",
      "Kilungu",
      "Ilima"
    ],
    "Makueni": [
      "Wote",
      "Muvau/Kikuumini",
      "Mavindini",
      "Kitise/Kithuki",
      "Kathonzweni",
      "Nzaui/Kilili/Kalamba",
      "Mbitini"
    ],
    "Kibwezi West": [
      "Makindu",
      "Nguumo",
      "Kikumbulyu North",
      "Kikumbulyu South",
      "Nguu/Masumba",
      "Emali/Mulala"
    ],
    "Kibwezi East": [
      "Masongaleni",
      "Mtito Andei",
      "Thange",
      "Ivingoni/Nzambani"
    ]
  },
  "Nyandarua": {
    "Kinangop": [
      "Engineer",
      "Gathara",
      "North Kinangop",
      "Murungaru",
      "Njabini/Kiburu",
      "Nyakio",
      "Magumu",
      "Githabai"
    ],
    "Kipipiri": [
      "Wanjohi",
      "Kipipiri",
      "Geta",
      "Githioro"
    ],
    "Ol Kalou": [
      "Karau",
      "Kanjuiri Ridge",
      "Mirangine",
      "Kaimbaga",
      "Rurii"
    ],
    "Ol Jorok": [
      "Gathanji",
      "Gatimu",
      "Weru"
    ],
    "Ndaragwa": [
      "Leshau/Pondo",
      "Kiriita",
      "Central",
      "Shamata"
    ]
  },
  "Nyeri": {
    "Nyeri Town": [
      "Rware",
      "Gatitu/Muruguru",
      "Ruring'u",
      "Kamakwa/Mukaro",
      "Kiganjo/Mathari"
    ],
    "Tetu": [
      "Dedan Kimathi",
      "Wamagana",
      "Aguthi-Gaaki"
    ],
    "Kieni East": [
      "Gakawa",
      "Naromoru Kiamathaga",
      "Thegu River"
    ],
    "Kieni West": [
      "Mweiga",
      "Mwiyogo/Endarasha",
      "Mugunda",
      "Gatarakwa"
    ],
    "Mathira East": [
      "Magutu",
      "Iriaini",
      "Konyu",
      "Kirimukuyu",
      "Karatina Town"
    ],
    "Mathira West": [
      "Ruguru",
      "Ngorano"
    ],
    "Othaya": [
      "Mahiga",
      "Iria-ini",
      "Chinga",
      "Karima"
    ],
    "Mukurwe-ini": [
      "Gikondi",
      "Rugi",
      "Mukurwe-ini West",
      "Mukurwe-ini Central"
    ]
  },
  "Kirinyaga": {
    "Mwea": [
      "Mutithi",
      "Kangai",
      "Thiba",
      "Wamumu",
      "Nyangati",
      "Murinduko",
      "Gathigiriri",
      "Tebere"
    ],
    "Gichugu": [
      "Kabare",
      "Baragwi",
      "Njukiini",
      "Ngariama",
      "Karumandi"
    ],
    "Ndia": [
      "Mukure",
      "Kiine",
      "Kariti"
    ],
    "Kirinyaga Central": [
      "Kanyekini",
      "Kerugoya",
      "Inoi",
      "Mutira"
    ]
  },
  "Murang'a": {
    "Kangema": [
      "Kanyenyaini",
      "Muguru",
      "Rwathia"
    ],
    "Mathioya": [
      "Gitugi",
      "Kiru",
      "Kamacharia"
    ],
    "Kiharu": [
      "Wangu",
      "Mugoiri",
      "Mbiri",
      "Township",
      "Murarandia",
      "Gaturi"
    ],
    "Kigumo": [
      "Kahumbu",
      "Muthithi",
      "Kigumo",
      "Kangari",
      "Kinyona"
    ],
    "Maragwa": [
      "Kimorori/Wempa",
      "Makuyu",
      "Kambiti",
      "Kamahuha",
      "Ichagaki",
      "Nginda"
    ],
    "Kandara": [
      "Ng'araria",
      "Muruka",
      "Kagundu-ini",
      "Gaichanjiru",
      "Ithiru",
      "Ruchu"
    ],
    "Gatanga": [
      "Ithanga",
      "Kakuzi/Mitubiri",
      "Mugumo-ini",
      "Kihumbu-ini",
      "Gatanga",
      "Kariara"
    ]
  },
  "Kiambu": {
    "Gatundu South": [
      "Kiamwangi",
      "Kiganjo",
      "Ndabibi",
      "Ngenda"
    ],
    "Gatundu North": [
      "Gituamba",
      "Githobokoni",
      "Chania",
      "Mang'u"
    ],
    "Juja": [
      "Murera",
      "Theta",
      "Juja",
      "Witeithie",
      "Kalimoni"
    ],
    "Thika Town": [
      "Township",
      "Kamenu",
      "Hospital",
      "Gatuanyaga",
      "Ngoliba"
    ],
    "Ruiru": [
      "Gitothua",
      "Biashara",
      "Gatongora",
      "Kahawa/Sukari",
      "Kahawa Wendani",
      "Kiuu",
      "Mwiki",
      "Mwihoko"
    ],
    "Githunguri": [
      "Githunguri",
      "Githiga",
      "Ikinu",
      "Ngewa",
      "Komothai"
    ],
    "Kiambu": [
      "Ting'ang'a",
      "Ndumberi",
      "Riabai",
      "Township"
    ],
    "Kiambaa": [
      "Cianda",
      "Karuri",
      "Ndenderu",
      "Muchatha",
      "Kihara"
    ],
    "Kabete": [
      "Gitaru",
      "Muguga",
      "Nyadhuna",
      "Kabete",
      "Uthiru"
    ],
    "Kikuyu": [
      "Karai",
      "Nachu",
      "Sigona",
      "Kikuyu",
      "Kinoo"
    ],
    "Limuru": [
      "Bibirioni",
      "Limuru Central",
      "Ndeiya",
      "Limuru East",
      "Ngecha Tigoni"
    ],
    "Lari": [
      "Kinale",
      "Kijabe",
      "Nyanduma",
      "Kamburu",
      "Lari/Kirenga"
    ]
  },
  "Turkana": {
    "Turkana North": [
      "Kaeris",
      "Lake Zone",
      "Lapur",
      "Kaaleng/Kaikor",
      "Kibish",
      "Nakalale"
    ],
    "Turkana West": [
      "Kakuma",
      "Lopur",
      "Letea",
      "Songot",
      "Kalobeyei",
      "Lokichoggio",
      "Nanaam"
    ],
    "Turkana Central": [
      "Kerio Delta",
      "Kang'atotha",
      "Kalokol",
      "Lodwar Township",
      "Kanamkemer"
    ],
    "Loima": [
      "Kotaruk/Lobei",
      "Turkwel",
      "Loima",
      "Lokiriama/Lorengegupi"
    ],
    "Turkana South": [
      "Kaputir",
      "Katilu",
      "Lobokat",
      "Kalapata",
      "Lokichar"
    ],
    "Turkana East": [
      "Kapedo/Napeitom",
      "Katilia",
      "Lokori/Kochodin"
    ]
  },
  "West Pokot": {
    "Kapenguria": [
      "Riwo",
      "Kapenguria",
      "Mnagei",
      "Siyoi",
      "Endugh",
      "Sook"
    ],
    "Sigor": [
      "Sekerr",
      "Masool",
      "Lomut",
      "Weiwei"
    ],
    "Kacheliba": [
      "Suam",
      "Kodich",
      "Kasei",
      "Kapchok",
      "Kiwawa",
      "Alale"
    ],
    "Pokot South": [
      "Chepareria",
      "Batei",
      "Lelan",
      "Tapach"
    ]
  },
  "Samburu": {
    "Samburu West": [
      "Lodokejek",
      "Suguta Marmar",
      "Maralal",
      "Loosuk",
      "Poro"
    ],
    "Samburu North": [
      "El-Barta",
      "Nachola",
      "Ndoto",
      "Nyiro",
      "Angata Nanyokie",
      "Baawa"
    ],
    "Samburu East": [
      "Waso",
      "Wamba West",
      "Wamba East",
      "Wamba North"
    ]
  },
  "Trans Nzoia": {
    "Kwanza": [
      "Kapomboi",
      "Kwanza",
      "Keiyo",
      "Bidii"
    ],
    "Endebess": [
      "Chepchoina",
      "Endebess",
      "Matumbei"
    ],
    "Saboti": [
      "Kinyoro",
      "Matisi",
      "Tuwani",
      "Saboti",
      "Machewa"
    ],
    "Kiminini": [
      "Kiminini",
      "Waitaluk",
      "Sirende",
      "Hospital",
      "Sikhendu",
      "Nabiswa"
    ],
    "Cherangany": [
      "Sinyerere",
      "Makutano",
      "Kaplamai",
      "Motongok",
      "Cherangany/Suwerwa",
      "Chepsiro/Kiptoror",
      "Sitatunga"
    ]
  },
  "Uasin Gishu": {
    "Soy": [
      "Moi's Bridge",
      "Kapkures",
      "Ziwa",
      "Segero/Barsombe",
      "Kipsomba",
      "Soy",
      "Kuinet/Kapsuswa"
    ],
    "Turbo": [
      "Ngenyilel",
      "Tapsagoi",
      "Kamagut",
      "Kiplombe",
      "Kapsaos",
      "Huruma"
    ],
    "Moiben": [
      "Tembelio",
      "Sergoit",
      "Karuna/Meibeki",
      "Moiben",
      "Kimumu"
    ],
    "Ainabkoi": [
      "Kapsoya",
      "Kaptagat",
      "Ainabkoi/Olare"
    ],
    "Kapseret": [
      "Simat/Kapseret",
      "Kipkenyo",
      "Ngeria",
      "Megun",
      "Langas"
    ],
    "Kesses": [
      "Racecourse",
      "Cheptiret/Kipchamo",
      "Tulwet/Chuiyat",
      "Tarakwa"
    ]
  },
  "Elgeyo-Marakwet": {
    "Marakwet East": [
      "Kapyego",
      "Sambirir",
      "Endo",
      "Embobut / Embolot"
    ],
    "Marakwet West": [
      "Lelan",
      "Sengwer",
      "Cherang'any/Chebororwa",
      "Moiben/Kuserwo",
      "Kapsowar",
      "Arror"
    ],
    "Keiyo North": [
      "Emsoo",
      "Kamariny",
      "Kapchemutwa",
      "Tambach"
    ],
    "Keiyo South": [
      "Kaptarakwa",
      "Chepkorio",
      "Soy North",
      "Soy South",
      "Kabiemit",
      "Metkei"
    ]
  },
  "Nandi": {
    "Tinderet": [
      "Songhor/Soba",
      "Tindiret",
      "Chemelil/Chemase",
      "Kapsimotwo"
    ],
    "Aldai": [
      "Maraba",
      "Terik",
      "Kemeloi-Maraba",
      "Kobujoi",
      "Kaptumo-Kaboi",
      "Koyo-Ndurio"
    ],
    "Nandi Hills": [
      "Nandi Hills",
      "Chepkunyuk",
      "Ol'lessos",
      "Kapchorua"
    ],
    "Chesumei": [
      "Chemundu/Kapng'etuny",
      "Kosirai",
      "Lelmokwo/Ngechek",
      "Kaptel/Kamoiywo",
      "Kiptuya"
    ],
    "Emgwen": [
      "Chepkumia",
      "Kapkangani",
      "Kapsabet",
      "Kilibwoni"
    ],
    "Mosop": [
      "Chepterwai",
      "Kipkaren",
      "Kurgung/Surungai",
      "Kabiyet",
      "Ndalat",
      "Kabisaga",
      "Sangalo/Kebulonik"
    ]
  },
  "Baringo": {
    "Baringo Central": [
      "Kabarnet",
      "Sacho",
      "Tenges",
      "Ewalel Chapchap",
      "Kapropita"
    ],
    "Baringo South": [
      "Marigat",
      "Ilchamus",
      "Mochongoi",
      "Mukutani"
    ],
    "Baringo North": [
      "Barwessa",
      "Kabartonjo",
      "Saimo/Kipsaraman",
      "Saimo/Soi",
      "Bartabwa"
    ],
    "Eldama Ravine": [
      "Lembus",
      "Lembus Kwen",
      "Ravine",
      "Mumberes/Maji Mazuri",
      "Lembus/Pekerra"
    ],
    "Mogotio": [
      "Mogotio",
      "Emining",
      "Kisanana"
    ],
    "Tiaty": [
      "Tirioko",
      "Kolowa",
      "Ribkwo",
      "Silale",
      "Loiyamorock",
      "Tangulbei/Korossi",
      "Churo/Amaya"
    ]
  },
  "Laikipia": {
    "Laikipia West": [
      "Ol-Moran",
      "Rumuruti Township",
      "Githiga",
      "Marmanet",
      "Igwamiti",
      "Salama"
    ],
    "Laikipia East": [
      "Ngobit",
      "Tigithi",
      "Thingithu",
      "Nanyuki",
      "Umande"
    ],
    "Laikipia North": [
      "Sosian",
      "Segera",
      "Mugogodo West",
      "Mugogodo East"
    ]
  },
  "Nakuru": {
    "Molo": [
      "Mariashoni",
      "Elburgon",
      "Turi",
      "Molo"
    ],
    "Njoro": [
      "Mau Narok",
      "Mauche",
      "Kihingo",
      "Nessuit",
      "Lare",
      "Njoro"
    ],
    "Naivasha": [
      "Biashara",
      "Hells Gate",
      "Lake View",
      "Maiella",
      "Mai Mahiu",
      "Olkaria",
      "Naivasha East",
      "Viwandani"
    ],
    "Gilgil": [
      "Gilgil",
      "Elementaita",
      "Mbaruk/Eburu",
      "Malewa West",
      "Murindat"
    ],
    "Kuresoi South": [
      "Amalo",
      "Keringet",
      "Kiptagich",
      "Tinet"
    ],
    "Kuresoi North": [
      "Kiptororo",
      "Nyota",
      "Sirikwa",
      "Kamara"
    ],
    "Subukia": [
      "Subukia",
      "Waseges",
      "Kabazi"
    ],
    "Rongai": [
      "Menengai West",
      "Soin",
      "Visoi",
      "Mosop",
      "Solai"
    ],
    "Bahati": [
      "Dundori",
      "Kabatini",
      "Kiamaina",
      "Bahati",
      "Lanet/Umoja"
    ],
    "Nakuru Town West": [
      "Barut",
      "London",
      "Kaptembwo",
      "Kapkures",
      "Rhoda",
      "Shaabab"
    ],
    "Nakuru Town East": [
      "Biashara",
      "Kivumbini",
      "Flamingo",
      "Menengai",
      "Nakuru East"
    ]
  },
  "Narok": {
    "Kilgoris": [
      "Kilgoris Central",
      "Keyian",
      "Angata Barikoi",
      "Shankoe",
      "Kimintet",
      "Lolgorian"
    ],
    "Emurua Dikirr": [
      "Ilkerin",
      "Ololmasani",
      "Mogondo",
      "Kapsasian"
    ],
    "Narok North": [
      "Olpusimoru",
      "Olorropil",
      "Melili",
      "Narok Town",
      "Nkareta",
      "Olokurto"
    ],
    "Narok East": [
      "Mosiro",
      "Ildamat",
      "Keekonyokie",
      "Suswa"
    ],
    "Narok South": [
      "Majimoto/Naroosura",
      "Ololulung'a",
      "Melelo",
      "Loita",
      "Sogoo",
      "Sagamian"
    ],
    "Narok West": [
      "Ilmotiok",
      "Mara",
      "Siana",
      "Naikarra"
    ]
  },
  "Kajiado": {
    "Kajiado North": [
      "Olkeri",
      "Ongata Rongai",
      "Nkaimurunya",
      "Oloolua",
      "Ngong"
    ],
    "Kajiado Central": [
      "Purko",
      "Ildamat",
      "Dalalekutuk",
      "Matapato North",
      "Matapato South"
    ],
    "Kajiado East": [
      "Kaputiei North",
      "Kitengela",
      "Oloosirkon/Sholinke",
      "Kenyawa-Poka",
      "Imaroro"
    ],
    "Kajiado West": [
      "Keekonyokie",
      "Iloodokilani",
      "Magadi",
      "Ewuaso Oonkidong'i",
      "Mosiro"
    ],
    "Kajiado South": [
      "Entonet/Mbirikani",
      "Kuku",
      "Rombo",
      "Kimana"
    ]
  },
  "Kericho": {
    "Kipkelion East": [
      "Londiani",
      "Kedowa/Kimugul",
      "Chepseon",
      "Tendeno/Sorget"
    ],
    "Kipkelion West": [
      "Kunyet",
      "Kipkelion",
      "Chilchila",
      "Kamasian"
    ],
    "Ainamoi": [
      "Kapsoit",
      "Ainamoi",
      "Kipchebor",
      "Kapkugerwet",
      "Kipchimchim",
      "Kapsaos"
    ],
    "Bureti": [
      "Kisiara",
      "Tebesonik",
      "Cheboin",
      "Chemosot",
      "Litein",
      "Cheplanget",
      "Kapkatet"
    ],
    "Belgut": [
      "Waldai",
      "Kabianga",
      "Cheptororiet/Seretut",
      "Chaik",
      "Kapsuser"
    ],
    "Sigowet/Soin": [
      "Sigowet",
      "Kaplelartet",
      "Soliat",
      "Soin"
    ]
  },
  "Bomet": {
    "Sotik": [
      "Ndanai/Abosi",
      "Chemagel",
      "Kipsonoi",
      "Aapsebet",
      "Rongena/Manaret"
    ],
    "Chepalungu": [
      "Kong'asis",
      "Nyangores",
      "Sigor",
      "Chebunyo",
      "Siongiroi"
    ],
    "Bomet East": [
      "Merigi",
      "Kembu",
      "Longisa",
      "Kipreres",
      "Chemaner"
    ],
    "Bomet Central": [
      "Silly",
      "Ndaraweta",
      "Singorwet",
      "Chesoen",
      "Mutarakwa"
    ],
    "Konoin": [
      "Chepchabas",
      "Kimulot",
      "Mogogosiek",
      "Boito",
      "Embomos"
    ]
  },
  "Kakamega": {
    "Lugari": [
      "Mautuma",
      "Lugari",
      "Lumakanda",
      "Chekalini",
      "Chevaywa",
      "Lwandeti"
    ],
    "Likuyani": [
      "Likuyani",
      "Sango",
      "Kongoni",
      "Nzoia",
      "Sinoko"
    ],
    "Malava": [
      "West Kabras",
      "Chemuche",
      "East Kabras",
      "South Kabras",
      "Manda-Shivanga",
      "Shirugu-Mugai"
    ],
    "Lurambi": [
      "Butsotso East",
      "Butsotso South",
      "Butsotso Central",
      "Sheywe",
      "Mahiakalo",
      "Shirere"
    ],
    "Navakholo": [
      "Ingotse-Mathia",
      "Shinoyi-Shikomari-Esumeyia",
      "Bunyala West",
      "Bunyala Central",
      "Bunyala East"
    ],
    "Mumias West": [
      "Mumias Central",
      "Mumias North",
      "Etenje",
      "Musanda"
    ],
    "Mumias East": [
      "Lusheya/Lubinu",
      "Malaha/Isongo/Makunga",
      "East Wanga"
    ],
    "Matungu": [
      "Koyonzo",
      "Kholera",
      "Khalaba",
      "Mayoni",
      "Namamali"
    ],
    "Butere": [
      "Marama West",
      "Marama Central",
      "Marenyo-Shianda",
      "Marama North",
      "Marama South"
    ],
    "Khwisero": [
      "Kisa North",
      "Kisa East",
      "Kisa West",
      "Kisa Central"
    ],
    "Shinyalu": [
      "Isukha North",
      "Isukha Central",
      "Isukha South",
      "Isukha East",
      "Isukha West",
      "Murhanda"
    ],
    "Ikolomani": [
      "Idakho South",
      "Idakho East",
      "Idakho North",
      "Idakho Central"
    ]
  },
  "Vihiga": {
    "Vihiga": [
      "Lugaga-Wamuluma",
      "South Maragoli",
      "Central Maragoli",
      "Mungoma"
    ],
    "Sabatia": [
      "Lyaduywa/Izava",
      "West Sabatia",
      "Chavakali",
      "North Maragoli",
      "Wodanga",
      "Busali"
    ],
    "Hamisi": [
      "Shiru",
      "Gisambai",
      "Shamakhokho",
      "Banja",
      "Muhudu",
      "Tambua",
      "Jepkoyai"
    ],
    "Luanda": [
      "Luanda Township",
      "Wemilabi",
      "Mwibona",
      "Luanda South",
      "Emabungo"
    ],
    "Emuhaya": [
      "North East Bunyore",
      "Central Bunyore",
      "West Bunyore"
    ]
  },
  "Bungoma": {
    "Mt. Elgon": [
      "Cheptais",
      "Chesikaki",
      "Chepyuk",
      "Kapkateny",
      "Kaptama",
      "Elgon"
    ],
    "Sirisia": [
      "Namwela",
      "Malakisi/South Kulisiru",
      "Lwandanyi"
    ],
    "Kabuchai": [
      "Kabuchai/Chwele",
      "West Nalondo",
      "Bwake/Luuya",
      "Mukuyuni"
    ],
    "Bumula": [
      "South Bukusu",
      "Bumula",
      "Khasoko",
      "Kabula",
      "Kimaeti",
      "West Bukusu",
      "Siboti"
    ],
    "Kanduyi": [
      "Bukembe West",
      "Bukembe East",
      "Township",
      "Khalaba",
      "Musikoma",
      "East Sang'alo",
      "Marakaru/Tuuti",
      "West Sang'alo"
    ],
    "Webuye West": [
      "Sitikho",
      "Matulo",
      "Bokoli"
    ],
    "Webuye East": [
      "Mihuu",
      "Ndivisi",
      "Maraka"
    ],
    "Kimilili": [
      "Kibingei",
      "Kimilili",
      "Maeni",
      "Kamukuywa"
    ],
    "Tongaren": [
      "Mbakalo",
      "Naitiri/Kabuyefwe",
      "Milima",
      "Ndalu/Tabani",
      "Tongaren",
      "Soysambu/ Mitua"
    ]
  },
  "Busia": {
    "Teso North": [
      "Malaba Central",
      "Malaba North",
      "Ang'urai South",
      "Ang'urai North",
      "Ang'urai East",
      "Kolanya"
    ],
    "Teso South": [
      "Ang'orom",
      "Chakoi South",
      "Amukura West",
      "Amukura East",
      "Amukura Central"
    ],
    "Nambale": [
      "Nambale Township",
      "Bukhayo North/Waltsi",
      "Bukhayo East",
      "Bukhayo Central"
    ],
    "Matayos": [
      "Bukhayo West",
      "Mayenje",
      "Matayos South",
      "Busia Township",
      "Burumba"
    ],
    "Butula": [
      "Marachi West",
      "Kingandole",
      "Marachi Central",
      "Marachi East",
      "Marachi North"
    ],
    "Funyula": [
      "Namboboto Nambuku",
      "Nangina",
      "Ageng'a Nanguba",
      "Bwiri"
    ],
    "Budalangi": [
      "Bunyala Central",
      "Bunyala North",
      "Bunyala West",
      "Bunyala South"
    ]
  },
  "Siaya": {
    "Ugenya": [
      "West Ugenya",
      "Ukwala",
      "North Ugenya",
      "East Ugenya"
    ],
    "Ugunja": [
      "Sidindi",
      "Sigomere",
      "Ugunja"
    ],
    "Alego Usonga": [
      "Usonga",
      "West Alego",
      "Central Alego",
      "Siaya Township",
      "North Alego",
      "South East Alego"
    ],
    "Gem": [
      "North Gem",
      "West Gem",
      "Central Gem",
      "Yala Township",
      "East Gem",
      "South Gem"
    ],
    "Bondo": [
      "West Yimbo",
      "Central Sakwa",
      "South Sakwa",
      "Yimbo East",
      "West Sakwa",
      "North Sakwa"
    ],
    "Rarieda": [
      "East Asembo",
      "West Asembo",
      "North Uyoma",
      "South Uyoma",
      "West Uyoma"
    ]
  },
  "Kisumu": {
    "Kisumu East": [
      "Kajulu",
      "Kolwa East",
      "Manyatta B",
      "Nyalenda A",
      "Kolwa Central"
    ],
    "Kisumu West": [
      "South West Kisumu",
      "Central Kisumu",
      "Kisumu North",
      "West Kisumu",
      "North West Kisumu"
    ],
    "Kisumu Central": [
      "Railways",
      "Migosi",
      "Shaurimoyo Kaloleni",
      "Market Milimani",
      "Kondele",
      "Nyalenda B"
    ],
    "Seme": [
      "West Seme",
      "Central Seme",
      "East Seme",
      "North Seme"
    ],
    "Nyando": [
      "East Kano/Wawidhi",
      "Awasi/Onjiko",
      "Ahero",
      "Kabonyo/Kanyagwal",
      "Kobura"
    ],
    "Muhoroni": [
      "Miwani",
      "Ombeyi",
      "Masogo/Nyang'oma",
      "Chemelil",
      "Muhoroni/Koru"
    ],
    "Nyakach": [
      "South West Nyakach",
      "North Nyakach",
      "Central Nyakach",
      "West Nyakach",
      "South East Nyakach"
    ]
  },
  "Homa Bay": {
    "Kasipul": [
      "West Kasipul",
      "South Kasipul",
      "Central Kasipul",
      "East Kamagak",
      "West Kamagak"
    ],
    "Kabondo Kasipul": [
      "Kabondo East",
      "Kabondo West",
      "Kokwanyo/Kakelo",
      "Kojwach"
    ],
    "Karachuonyo": [
      "West Karachuonyo",
      "North Karachuonyo",
      "Central",
      "Kanyaluo",
      "Kibiri",
      "Wangchieng",
      "Kendu Bay Town"
    ],
    "Rangwe": [
      "West Gem",
      "East Gem",
      "Kagan",
      "Kochia"
    ],
    "Homa Bay Town": [
      "Homa Bay Central",
      "Homa Bay Arujo",
      "Homa Bay West",
      "Homa Bay East"
    ],
    "Ndhiwa": [
      "Kwabwai",
      "Kanyadoto",
      "Kanyikela",
      "Kabuoch North",
      "Kabuoch South/Pala",
      "Kanyamwa Kologi",
      "Kanyamwa Kosewe"
    ],
    "Suba North": [
      "Rusinga Island",
      "Kasgunga",
      "Gembe",
      "Lambwe",
      "Mbita"
    ],
    "Suba South": [
      "Gwassi South",
      "Gwassi North",
      "Kaksingri West",
      "Ruma Kaksingri"
    ]
  },
  "Migori": {
    "Rongo": [
      "North Kamagambo",
      "Central Kamagambo",
      "East Kamagambo",
      "South Kamagambo"
    ],
    "Awendo": [
      "North Sakwa",
      "South Sakwa",
      "West Sakwa",
      "Central Sakwa"
    ],
    "Suna East": [
      "God Jope",
      "Suna Central",
      "Kkakrao",
      "Kwa"
    ],
    "Suna West": [
      "Wiga",
      "Wasweta II",
      "Ragana-Oruba",
      "Wasimbete"
    ],
    "Uriri": [
      "West Kanyamkago",
      "North Kanyamkago",
      "Central Kanyamkago",
      "South Kanyamkago",
      "East Kanyamkago"
    ],
    "Nyatike": [
      "Kachien'g",
      "Kanyasa",
      "North Kadem",
      "Macalder/Kanyarwanda",
      "Kaler",
      "Got Kachola",
      "Muhuru"
    ],
    "Kuria West": [
      "Bukira East",
      "Bukira Centrl/Ikerege",
      "Isibania",
      "Makerero",
      "Masaba",
      "Tagare",
      "Nyamosense/Komosoko"
    ],
    "Kuria East": [
      "Gokeharaka/Getambwega",
      "Ntimaru West",
      "Ntimaru East",
      "Nyabasi East",
      "Nyabasi West"
    ]
  },
  "Kisii": {
    "Bonchari": [
      "Bomariba",
      "Bogiakumu",
      "Bomorenda",
      "Riana"
    ],
    "South Mugirango": [
      "Bogetenga",
      "Borabu / Chitago",
      "Moticho",
      "Getenga",
      "Tabaka",
      "Boikanga"
    ],
    "Bomachoge Borabu": [
      "Bombaba Borabu",
      "Boochi Borabu",
      "Bokimonge",
      "Magenche"
    ],
    "Bobasi": [
      "Masige West",
      "Masige East",
      "Bobasi Central",
      "Nyacheki",
      "Bassi Bogetaorio",
      "Bobasi Chache",
      "Sameta/Mokwerero",
      "Bobasi/Boitangare"
    ],
    "Bomachoge Chache": [
      "Majoge Basi",
      "Boochi/Tendere",
      "Bosoti/Sengera"
    ],
    "Nyaribari Masaba": [
      "Ichuni",
      "Nyamasibi",
      "Masimba",
      "Gesusu",
      "Kiamokama"
    ],
    "Nyaribari Chache": [
      "Bobaracho",
      "Kisii Central",
      "Keumbu",
      "Kiogoro",
      "Ibeno",
      "Birongo"
    ],
    "Kitutu Chache North": [
      "Monyerero",
      "Sensi",
      "Marani",
      "Kegogi"
    ],
    "Kitutu Chache South": [
      "Bogusero",
      "Bogeka",
      "Nyakoe",
      "Kitutu Central",
      "Nyatieko"
    ]
  },
  "Nyamira": {
    "Kitutu Masaba": [
      "Rigoma",
      "Gachuba",
      "Kemera",
      "Magombo",
      "Manga",
      "Gesima"
    ],
    "West Mugirango": [
      "Nyamaiya",
      "Bogichora",
      "Bosamaro",
      "Bonyamatuta",
      "Township"
    ],
    "North Mugirango": [
      "Itibo",
      "Bomwagamo",
      "Bokeira",
      "Magwagwa",
      "Ekerenyo"
    ],
    "Borabu": [
      "Mekenene",
      "Kiabonyoru",
      "Esise",
      "Nyansiongo"
    ]
  },
  "Nairobi": {
    "Westlands": [
      "Kitisuru",
      "Parklands/Highridge",
      "Karura",
      "Kangemi",
      "Mountain View"
    ],
    "Dagoretti North": [
      "Kilimani",
      "Kawangware",
      "Gatina",
      "Kileleshwa",
      "Kabiro"
    ],
    "Dagoretti South": [
      "Mutu-ini",
      "Ngando",
      "Riruta",
      "Uthiru/Ruthimitu",
      "Waithaka"
    ],
    "Langata": [
      "Karen",
      "Nairobi West",
      "Mugumo-ini",
      "South C",
      "Nyayo Highrise"
    ],
    "Kibra": [
      "Laini Saba",
      "Lindi",
      "Makina",
      "Woodley/Kenyatta Golf Course",
      "Sarang'ombe"
    ],
    "Roysambu": [
      "Githurai",
      "Kahawa West",
      "Zimmerman",
      "Roysambu",
      "Kahawa"
    ],
    "Kasarani": [
      "Clay City",
      "Mwiki",
      "Kasarani",
      "Njiru",
      "Ruai"
    ],
    "Ruaraka": [
      "Babadogo",
      "Utalii",
      "Mathare North",
      "Lucky Summer",
      "Korogocho"
    ],
    "Embakasi South": [
      "Imara Daima",
      "Kwa Njenga",
      "Kwa Reuben",
      "Pipeline",
      "Kware"
    ],
    "Embakasi North": [
      "Kariobangi North",
      "Dandora Area I",
      "Dandora Area II",
      "Dandora Area III",
      "Dandora Area IV"
    ],
    "Embakasi Central": [
      "Kayole North",
      "Kayole North Central",
      "Kayole South",
      "Komarock",
      "Matopeni/Spring Valley"
    ],
    "Embakasi East": [
      "Upper Savannah",
      "Lower Savannah",
      "Embakasi",
      "Utawala",
      "Mihang'o"
    ],
    "Embakasi West": [
      "Umoja I",
      "Umoja II",
      "Mowlem",
      "Kariobangi South"
    ],
    "Makadara": [
      "Maringo/Hamza",
      "Viwandani",
      "Harambee",
      "Makongeni"
    ],
    "Kamukunji": [
      "Pumwani",
      "Eastleigh North",
      "Eastleigh South",
      "Airbase",
      "California"
    ],
    "Starehe": [
      "Nairobi Central",
      "Ngara",
      "Pangani",
      "Ziwani/Kariokor",
      "Landimawe",
      "Nairobi South"
    ],
    "Mathare": [
      "Hospital",
      "Mabatini",
      "Huruma",
      "Ngei",
      "Mlango Kubwa",
      "Kiamaiko"
    ]
  }
};

export function getCountyLocations(countyName: string): { subCounties: SubCountyRecord[]; wards: WardRecord[] } {
  if (typeof window === 'undefined') {
    return buildDefaultCounty(countyName);
  }

  const cleanName = countyName.trim();
  const norm = cleanName.toLowerCase();
  const key = `${STORAGE_PREFIX}${norm}`;
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.subCounties) && Array.isArray(parsed.wards) && parsed.subCounties.length > 0) {
        return parsed;
      }
    } catch {
      /* parse failed */
    }
  }

  const seeded = buildDefaultCounty(cleanName);
  try {
    localStorage.setItem(key, JSON.stringify(seeded));
  } catch {
    /* storage blocked */
  }
  return seeded;
}

function findMatchingCountyKey(countyName: string): string | null {
  const norm = countyName.trim().toLowerCase().replace(/county/g, '').trim();
  for (const key of Object.keys(ALL_KENYA_COUNTIES_DATA)) {
    if (key.toLowerCase() === norm || norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) {
      return key;
    }
  }
  return null;
}

function buildDefaultCounty(countyName: string): { subCounties: SubCountyRecord[]; wards: WardRecord[] } {
  const matchedKey = findMatchingCountyKey(countyName) || 'Nyeri';
  const countyDataset = ALL_KENYA_COUNTIES_DATA[matchedKey] || ALL_KENYA_COUNTIES_DATA['Nyeri'];
  const norm = matchedKey.toLowerCase();

  const subCounties: SubCountyRecord[] = Object.keys(countyDataset).map((scName) => ({
    id: `sc_${norm}_${scName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: scName,
    county: matchedKey,
  }));

  const wards: WardRecord[] = [];
  Object.entries(countyDataset).forEach(([scName, wardList]) => {
    wardList.forEach((wName) => {
      wards.push({
        id: `w_${norm}_${wName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name: wName,
        subCountyName: scName,
        county: matchedKey,
      });
    });
  });

  return { subCounties, wards };
}

export function saveCountyLocations(
  countyName: string,
  data: { subCounties: SubCountyRecord[]; wards: WardRecord[] }
): void {
  if (typeof window === 'undefined') return;
  const cleanName = countyName.trim();
  const matchedKey = findMatchingCountyKey(cleanName) || cleanName;
  const key = `${STORAGE_PREFIX}${matchedKey.toLowerCase()}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('erates:locations_updated', { detail: { county: matchedKey, ...data } }));
  } catch {
    /* storage blocked */
  }
}
