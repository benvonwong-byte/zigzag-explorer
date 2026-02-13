import { ZZStructure } from '../model/ZZStructure';

// ---------------------------------------------------------------------------
// Character definition helper type
// ---------------------------------------------------------------------------
interface SWCharacter {
  id: string;
  name: string;
  species: string;
  homeworld: string;
  faction: string;
  era: string;
  forceUser: string;
  role: string;
  status: string;
}

// ---------------------------------------------------------------------------
// All 150 Star Wars characters
// ---------------------------------------------------------------------------
const characters: SWCharacter[] = [
  // ---- Original Trilogy heroes ----
  { id: 'luke',          name: 'Luke Skywalker',       species: 'Human',         homeworld: 'Tatooine',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'yes', role: 'Warrior',        status: 'Alive' },
  { id: 'leia',          name: 'Leia Organa',          species: 'Human',         homeworld: 'Alderaan',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'yes', role: 'Leader',         status: 'Dead' },
  { id: 'han',           name: 'Han Solo',             species: 'Human',         homeworld: 'Corellia',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Smuggler',       status: 'Dead' },
  { id: 'chewie',        name: 'Chewbacca',            species: 'Wookiee',       homeworld: 'Kashyyyk',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'obiwan',        name: 'Obi-Wan Kenobi',       species: 'Human',         homeworld: 'Stewjon',     faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'yoda',          name: 'Yoda',                 species: 'Unknown',       homeworld: 'Unknown',     faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'vader',         name: 'Darth Vader',          species: 'Human',         homeworld: 'Tatooine',    faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'palpatine',     name: 'Palpatine',            species: 'Human',         homeworld: 'Naboo',       faction: 'Sith',            era: 'Prequel Era',    forceUser: 'yes', role: 'Leader',         status: 'Dead' },
  { id: 'r2d2',          name: 'R2-D2',                species: 'Droid',         homeworld: 'Naboo',       faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Mechanic',       status: 'Alive' },
  { id: 'c3po',          name: 'C-3PO',                species: 'Droid',         homeworld: 'Tatooine',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Diplomat',       status: 'Alive' },
  { id: 'lando',         name: 'Lando Calrissian',     species: 'Human',         homeworld: 'Socorro',     faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Smuggler',       status: 'Alive' },
  { id: 'boba',          name: 'Boba Fett',            species: 'Human',         homeworld: 'Kamino',      faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Alive' },
  { id: 'jabba',         name: 'Jabba the Hutt',       species: 'Hutt',          homeworld: 'Nal Hutta',   faction: 'Hutt Cartel',     era: 'Original Era',   forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'wedge',         name: 'Wedge Antilles',       species: 'Human',         homeworld: 'Corellia',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Pilot',          status: 'Alive' },
  { id: 'ackbar',        name: 'Admiral Ackbar',       species: 'Mon Calamari',  homeworld: 'Mon Cala',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'nien',          name: 'Nien Nunb',            species: 'Sullustan',     homeworld: 'Sullust',     faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Pilot',          status: 'Dead' },
  { id: 'mothma',        name: 'Mon Mothma',           species: 'Human',         homeworld: 'Chandrila',   faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Politician',     status: 'Alive' },
  { id: 'tarkin',        name: 'Grand Moff Tarkin',    species: 'Human',         homeworld: 'Eriadu',      faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'piett',         name: 'Admiral Piett',        species: 'Human',         homeworld: 'Axxila',      faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'veers',         name: 'General Veers',        species: 'Human',         homeworld: 'Denon',       faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Unknown' },
  { id: 'biggs',         name: 'Biggs Darklighter',    species: 'Human',         homeworld: 'Tatooine',    faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Pilot',          status: 'Dead' },
  { id: 'wicket',        name: 'Wicket W. Warrick',    species: 'Ewok',          homeworld: 'Endor',       faction: 'Rebel Alliance',  era: 'Original Era',   forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'ig88',          name: 'IG-88',                species: 'Droid',         homeworld: 'Holowan',     faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },
  { id: 'bossk',         name: 'Bossk',                species: 'Trandoshan',    homeworld: 'Trandosha',   faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Alive' },
  { id: 'dengar',        name: 'Dengar',               species: 'Human',         homeworld: 'Corellia',    faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Unknown' },
  { id: 'lobot',         name: 'Lobot',                species: 'Human',         homeworld: 'Bespin',      faction: 'Neutral',         era: 'Original Era',   forceUser: 'no',  role: 'Mechanic',       status: 'Unknown' },
  { id: 'maxrebo',       name: 'Max Rebo',             species: 'Ortolan',       homeworld: 'Orto',        faction: 'Neutral',         era: 'Original Era',   forceUser: 'no',  role: 'Diplomat',       status: 'Alive' },

  // ---- Prequel Trilogy characters ----
  { id: 'anakin',        name: 'Anakin Skywalker',      species: 'Human',         homeworld: 'Tatooine',    faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'padme',         name: 'Padmé Amidala',         species: 'Human',         homeworld: 'Naboo',       faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Politician',     status: 'Dead' },
  { id: 'macewindu',     name: 'Mace Windu',            species: 'Human',         homeworld: 'Haruun Kal',  faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'dooku',         name: 'Count Dooku',           species: 'Human',         homeworld: 'Serenno',     faction: 'Sith',            era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'grievous',      name: 'General Grievous',      species: 'Kaleesh',       homeworld: 'Kalee',       faction: 'Separatists',     era: 'Prequel Era',    forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'maul',          name: 'Darth Maul',            species: 'Zabrak',        homeworld: 'Dathomir',    faction: 'Sith',            era: 'Prequel Era',    forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'quigon',        name: 'Qui-Gon Jinn',          species: 'Human',         homeworld: 'Coruscant',   faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'jango',         name: 'Jango Fett',            species: 'Human',         homeworld: 'Concord Dawn',faction: 'Bounty Hunters',  era: 'Prequel Era',    forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },
  { id: 'watto',         name: 'Watto',                 species: 'Toydarian',     homeworld: 'Toydaria',    faction: 'Neutral',         era: 'Prequel Era',    forceUser: 'no',  role: 'Smuggler',       status: 'Unknown' },
  { id: 'sebulba',       name: 'Sebulba',               species: 'Dug',           homeworld: 'Malastare',   faction: 'Neutral',         era: 'Prequel Era',    forceUser: 'no',  role: 'Pilot',          status: 'Unknown' },
  { id: 'jarjar',        name: 'Jar Jar Binks',         species: 'Gungan',        homeworld: 'Naboo',       faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Politician',     status: 'Alive' },
  { id: 'bossnass',      name: 'Boss Nass',             species: 'Gungan',        homeworld: 'Naboo',       faction: 'Neutral',         era: 'Prequel Era',    forceUser: 'no',  role: 'Leader',         status: 'Unknown' },
  { id: 'kitfisto',      name: 'Kit Fisto',             species: 'Nautolan',      homeworld: 'Glee Anselm', faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'plokoon',       name: 'Plo Koon',              species: 'Kel Dor',       homeworld: 'Dorin',       faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'kiadimundi',    name: 'Ki-Adi-Mundi',          species: 'Cerean',        homeworld: 'Cerea',       faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'aaylasecura',   name: 'Aayla Secura',          species: "Twi'lek",       homeworld: 'Ryloth',      faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'barriss',       name: 'Barriss Offee',         species: 'Mirialan',      homeworld: 'Mirial',      faction: 'Jedi Order',      era: 'Clone Wars',     forceUser: 'yes', role: 'Apprentice',     status: 'Unknown' },
  { id: 'luminara',      name: 'Luminara Unduli',       species: 'Mirialan',      homeworld: 'Mirial',      faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'nutegunray',    name: 'Nute Gunray',           species: 'Neimoidian',    homeworld: 'Neimoidia',   faction: 'Separatists',     era: 'Prequel Era',    forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'shaaktii',      name: 'Shaak Ti',              species: 'Togruta',       homeworld: 'Shili',       faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'bail',          name: 'Bail Organa',           species: 'Human',         homeworld: 'Alderaan',    faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Politician',     status: 'Dead' },
  { id: 'depa',          name: 'Depa Billaba',          species: 'Human',         homeworld: 'Chalacta',    faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'shmi',          name: 'Shmi Skywalker',        species: 'Human',         homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Prequel Era',    forceUser: 'no',  role: 'Diplomat',       status: 'Dead' },
  { id: 'cliegg',        name: 'Cliegg Lars',           species: 'Human',         homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Prequel Era',    forceUser: 'no',  role: 'Diplomat',       status: 'Dead' },
  { id: 'zamwesell',     name: 'Zam Wesell',            species: 'Clawdite',      homeworld: 'Zolan',       faction: 'Bounty Hunters',  era: 'Prequel Era',    forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },

  // ---- Clone Wars characters ----
  { id: 'ahsoka',        name: 'Ahsoka Tano',           species: 'Togruta',       homeworld: 'Shili',       faction: 'Jedi Order',      era: 'Clone Wars',     forceUser: 'yes', role: 'Warrior',        status: 'Alive' },
  { id: 'rex',           name: 'Rex',                   species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Commander',      status: 'Alive' },
  { id: 'ventress',      name: 'Asajj Ventress',        species: 'Dathomirian',   homeworld: 'Dathomir',    faction: 'Sith',            era: 'Clone Wars',     forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'savage',        name: 'Savage Opress',          species: 'Zabrak',        homeworld: 'Dathomir',    faction: 'Sith',            era: 'Clone Wars',     forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'cadbane',       name: 'Cad Bane',              species: 'Duros',         homeworld: 'Duro',        faction: 'Bounty Hunters',  era: 'Clone Wars',     forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },
  { id: 'hondo',         name: 'Hondo Ohnaka',          species: 'Weequay',       homeworld: 'Sriluur',     faction: 'Neutral',         era: 'Clone Wars',     forceUser: 'no',  role: 'Smuggler',       status: 'Alive' },
  { id: 'previzsla',     name: 'Pre Vizsla',            species: 'Human',         homeworld: 'Mandalore',   faction: 'Mandalorians',    era: 'Clone Wars',     forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'satine',        name: 'Satine Kryze',          species: 'Human',         homeworld: 'Mandalore',   faction: 'Mandalorians',    era: 'Clone Wars',     forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'cody',          name: 'Commander Cody',        species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Commander',      status: 'Unknown' },
  { id: 'fives',         name: 'Fives',                 species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Warrior',        status: 'Dead' },
  { id: 'echo',          name: 'Echo',                  species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'mothertalzin',  name: 'Mother Talzin',         species: 'Dathomirian',   homeworld: 'Dathomir',    faction: 'Neutral',         era: 'Clone Wars',     forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'embo',          name: 'Embo',                  species: 'Kyuzo',         homeworld: 'Phatrong',    faction: 'Bounty Hunters',  era: 'Clone Wars',     forceUser: 'no',  role: 'Bounty Hunter',  status: 'Unknown' },
  { id: 'aurra',         name: 'Aurra Sing',            species: 'Human',         homeworld: 'Nar Shaddaa', faction: 'Bounty Hunters',  era: 'Clone Wars',     forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },

  // ---- Sequel Trilogy characters ----
  { id: 'rey',           name: 'Rey',                   species: 'Human',         homeworld: 'Jakku',       faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'yes', role: 'Warrior',        status: 'Alive' },
  { id: 'finn',          name: 'Finn',                  species: 'Human',         homeworld: 'Unknown',     faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'yes', role: 'Warrior',        status: 'Alive' },
  { id: 'poe',           name: 'Poe Dameron',           species: 'Human',         homeworld: 'Yavin IV',    faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'no',  role: 'Pilot',          status: 'Alive' },
  { id: 'kyloren',       name: 'Kylo Ren',              species: 'Human',         homeworld: 'Chandrila',   faction: 'First Order',     era: 'Sequel Era',     forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'snoke',         name: 'Snoke',                 species: 'Unknown',       homeworld: 'Unknown',     faction: 'First Order',     era: 'Sequel Era',     forceUser: 'yes', role: 'Leader',         status: 'Dead' },
  { id: 'bb8',           name: 'BB-8',                  species: 'Droid',         homeworld: 'Unknown',     faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'no',  role: 'Mechanic',       status: 'Alive' },
  { id: 'hux',           name: 'General Hux',           species: 'Human',         homeworld: 'Arkanis',     faction: 'First Order',     era: 'Sequel Era',     forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'phasma',        name: 'Captain Phasma',        species: 'Human',         homeworld: 'Parnassos',   faction: 'First Order',     era: 'Sequel Era',     forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'rose',          name: 'Rose Tico',             species: 'Human',         homeworld: 'Hays Minor',  faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'no',  role: 'Mechanic',       status: 'Alive' },
  { id: 'maz',           name: 'Maz Kanata',            species: 'Unknown',       homeworld: 'Takodana',    faction: 'Neutral',         era: 'Sequel Era',     forceUser: 'yes', role: 'Diplomat',       status: 'Alive' },
  { id: 'holdo',         name: 'Vice Admiral Holdo',    species: 'Human',         homeworld: 'Gatalenta',   faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'pryde',         name: 'Allegiant General Pryde', species: 'Human',       homeworld: 'Alsakan',     faction: 'First Order',     era: 'Sequel Era',     forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'zoriibliss',    name: 'Zorii Bliss',           species: 'Human',         homeworld: 'Kijimi',      faction: 'Neutral',         era: 'Sequel Era',     forceUser: 'no',  role: 'Smuggler',       status: 'Alive' },
  { id: 'jannah',        name: 'Jannah',                species: 'Human',         homeworld: 'Unknown',     faction: 'Resistance',      era: 'Sequel Era',     forceUser: 'no',  role: 'Warrior',        status: 'Alive' },

  // ---- Rogue One characters ----
  { id: 'jyn',           name: 'Jyn Erso',              species: 'Human',         homeworld: 'Vallt',       faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Dead' },
  { id: 'cassian',       name: 'Cassian Andor',         species: 'Human',         homeworld: 'Fest',        faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'k2so',          name: 'K-2SO',                 species: 'Droid',         homeworld: 'Unknown',     faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Dead' },
  { id: 'chirrut',       name: 'Chirrut Îmwe',          species: 'Human',         homeworld: 'Jedha',       faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Dead' },
  { id: 'baze',          name: 'Baze Malbus',           species: 'Human',         homeworld: 'Jedha',       faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Dead' },
  { id: 'krennic',       name: 'Director Krennic',      species: 'Human',         homeworld: 'Lexrul',      faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'bodhi',         name: 'Bodhi Rook',            species: 'Human',         homeworld: 'Jedha',       faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Pilot',          status: 'Dead' },
  { id: 'saw',           name: 'Saw Gerrera',           species: 'Human',         homeworld: 'Onderon',     faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Dead' },

  // ---- Rebels characters ----
  { id: 'ezra',          name: 'Ezra Bridger',          species: 'Human',         homeworld: 'Lothal',      faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'yes', role: 'Apprentice',     status: 'Alive' },
  { id: 'kanan',         name: 'Kanan Jarrus',          species: 'Human',         homeworld: 'Coruscant',   faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'hera',          name: 'Hera Syndulla',         species: "Twi'lek",       homeworld: 'Ryloth',      faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Pilot',          status: 'Alive' },
  { id: 'sabine',        name: 'Sabine Wren',           species: 'Human',         homeworld: 'Mandalore',   faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'zeb',           name: 'Zeb Orrelios',          species: 'Lasat',         homeworld: 'Lasan',       faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'chopper',       name: 'Chopper',               species: 'Droid',         homeworld: 'Unknown',     faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Mechanic',       status: 'Alive' },
  { id: 'thrawn',        name: 'Grand Admiral Thrawn',  species: 'Chiss',         homeworld: 'Csilla',      faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Alive' },
  { id: 'kallus',        name: 'Agent Kallus',          species: 'Human',         homeworld: 'Coruscant',   faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Alive' },
  { id: 'inquisitor',    name: 'The Grand Inquisitor',  species: 'Pau\'an',       homeworld: 'Utapau',      faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'yes', role: 'Warrior',        status: 'Dead' },

  // ---- Mandalorian characters ----
  { id: 'din',           name: 'Din Djarin',            species: 'Human',         homeworld: 'Aq Vetina',   faction: 'Mandalorians',    era: 'Between Eras',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Alive' },
  { id: 'grogu',         name: 'Grogu',                 species: 'Unknown',       homeworld: 'Unknown',     faction: 'Jedi Order',      era: 'Between Eras',   forceUser: 'yes', role: 'Apprentice',     status: 'Alive' },
  { id: 'gideon',        name: 'Moff Gideon',           species: 'Human',         homeworld: 'Unknown',     faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'caradune',      name: 'Cara Dune',             species: 'Human',         homeworld: 'Alderaan',    faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'greef',         name: 'Greef Karga',           species: 'Human',         homeworld: 'Unknown',     faction: 'Bounty Hunters',  era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'armorer',       name: 'The Armorer',           species: 'Human',         homeworld: 'Mandalore',   faction: 'Mandalorians',    era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'fennec',        name: 'Fennec Shand',          species: 'Human',         homeworld: 'Unknown',     faction: 'Bounty Hunters',  era: 'Between Eras',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Alive' },
  { id: 'cobbvanth',     name: 'Cobb Vanth',            species: 'Human',         homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'bokatan',       name: 'Bo-Katan Kryze',        species: 'Human',         homeworld: 'Mandalore',   faction: 'Mandalorians',    era: 'Clone Wars',     forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'kuiil',         name: 'Kuiil',                 species: 'Ugnaught',      homeworld: 'Unknown',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Mechanic',       status: 'Dead' },
  { id: 'ig11',          name: 'IG-11',                 species: 'Droid',         homeworld: 'Unknown',     faction: 'Bounty Hunters',  era: 'Between Eras',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },
  { id: 'mayfeld',       name: 'Migs Mayfeld',          species: 'Human',         homeworld: 'Unknown',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Smuggler',       status: 'Alive' },

  // ---- Solo film characters ----
  { id: 'qi_ra',         name: "Qi'ra",                 species: 'Human',         homeworld: 'Corellia',    faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Smuggler',       status: 'Unknown' },
  { id: 'tobias',        name: 'Tobias Beckett',        species: 'Human',         homeworld: 'Glee Anselm', faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Smuggler',       status: 'Dead' },
  { id: 'enfysnest',     name: 'Enfys Nest',            species: 'Human',         homeworld: 'Unknown',     faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'dryden',        name: 'Dryden Vos',            species: 'Human',         homeworld: 'Unknown',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'l337',          name: 'L3-37',                 species: 'Droid',         homeworld: 'Unknown',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Pilot',          status: 'Dead' },
  { id: 'val',           name: 'Val',                   species: 'Human',         homeworld: 'Unknown',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Warrior',        status: 'Dead' },

  // ---- Imperial officers & agents ----
  { id: 'isb_dedra',     name: 'Dedra Meero',           species: 'Human',         homeworld: 'Coruscant',   faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Unknown' },
  { id: 'jerjerrod',     name: 'Moff Jerjerrod',        species: 'Human',         homeworld: 'Tinnel IV',   faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'ozzel',         name: 'Admiral Ozzel',         species: 'Human',         homeworld: 'Carida',      faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },

  // ---- Jedi Temple / Extended Jedi ----
  { id: 'yaddle',        name: 'Yaddle',                species: 'Unknown',       homeworld: 'Unknown',     faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'eethkoth',      name: 'Eeth Koth',             species: 'Zabrak',        homeworld: 'Iridonia',    faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'saeeseetiin',   name: 'Saesee Tiin',           species: 'Iktotchi',      homeworld: 'Iktotch',     faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'agenfolar',     name: 'Agen Kolar',            species: 'Zabrak',        homeworld: 'Iridonia',    faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  { id: 'stasallie',     name: 'Stass Allie',           species: 'Tholothian',    homeworld: 'Tholoth',     faction: 'Jedi Order',      era: 'Prequel Era',    forceUser: 'yes', role: 'Master',         status: 'Dead' },
  // ---- Separatist leaders ----
  { id: 'poggle',        name: 'Poggle the Lesser',     species: 'Geonosian',     homeworld: 'Geonosis',    faction: 'Separatists',     era: 'Prequel Era',    forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'wattambor',     name: 'Wat Tambor',            species: 'Skakoan',       homeworld: 'Skako',       faction: 'Separatists',     era: 'Prequel Era',    forceUser: 'no',  role: 'Leader',         status: 'Dead' },
  { id: 'sanhill',       name: 'San Hill',              species: 'Muun',          homeworld: 'Muunilinst',  faction: 'Separatists',     era: 'Prequel Era',    forceUser: 'no',  role: 'Leader',         status: 'Dead' },

  // ---- Bad Batch ----
  { id: 'hunter',        name: 'Hunter',                species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Commander',      status: 'Alive' },
  { id: 'wrecker',       name: 'Wrecker',               species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'tech',          name: 'Tech',                  species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Scientist',      status: 'Dead' },
  { id: 'crosshair',     name: 'Crosshair',             species: 'Human',         homeworld: 'Kamino',      faction: 'Galactic Empire', era: 'Clone Wars',     forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'omega',         name: 'Omega',                 species: 'Human',         homeworld: 'Kamino',      faction: 'Republic',        era: 'Clone Wars',     forceUser: 'no',  role: 'Apprentice',     status: 'Alive' },

  // ---- Additional notable characters ----
  { id: 'greedo',        name: 'Greedo',                species: 'Rodian',        homeworld: 'Rodia',       faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Dead' },
  { id: 'tuskenraider',  name: 'Tusken Chieftain',      species: 'Tusken',        homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Original Era',   forceUser: 'no',  role: 'Leader',         status: 'Unknown' },
  { id: 'owenlars',      name: 'Owen Lars',             species: 'Human',         homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Original Era',   forceUser: 'no',  role: 'Diplomat',       status: 'Dead' },
  { id: 'berulars',      name: 'Beru Lars',             species: 'Human',         homeworld: 'Tatooine',    faction: 'Neutral',         era: 'Original Era',   forceUser: 'no',  role: 'Diplomat',       status: 'Dead' },
  { id: 'raddus',        name: 'Admiral Raddus',        species: 'Mon Calamari',  homeworld: 'Mon Cala',    faction: 'Rebel Alliance',  era: 'Between Eras',   forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  { id: 'galenErso',     name: 'Galen Erso',            species: 'Human',         homeworld: 'Grange',      faction: 'Neutral',         era: 'Between Eras',   forceUser: 'no',  role: 'Scientist',      status: 'Dead' },
  { id: 'cienaree',      name: 'Ciena Ree',             species: 'Human',         homeworld: 'Jelucan',     faction: 'Galactic Empire', era: 'Original Era',   forceUser: 'no',  role: 'Pilot',          status: 'Alive' },
  // ---- Inquisitors & Fallen ----
  { id: 'secondsis',     name: 'Second Sister',         species: 'Human',         homeworld: 'Unknown',     faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'reva',          name: 'Reva Sevander',         species: 'Human',         homeworld: 'Coruscant',   faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'yes', role: 'Warrior',        status: 'Alive' },

  // ---- Bounty Hunters Guild extras ----
  { id: 'zuckuss',       name: 'Zuckuss',               species: 'Gand',          homeworld: 'Gand',        faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Unknown' },
  { id: 'fourLom',       name: '4-LOM',                 species: 'Droid',         homeworld: 'Unknown',     faction: 'Bounty Hunters',  era: 'Original Era',   forceUser: 'no',  role: 'Bounty Hunter',  status: 'Unknown' },

  // ---- Naboo extras ----
  { id: 'captpanaka',    name: 'Captain Panaka',        species: 'Human',         homeworld: 'Naboo',       faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Commander',      status: 'Dead' },
  // ---- Miscellaneous film favorites ----
  { id: 'tarrful',       name: 'Tarfful',               species: 'Wookiee',       homeworld: 'Kashyyyk',    faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
  { id: 'slymoore',      name: 'Sly Moore',             species: 'Umbaran',       homeworld: 'Umbara',      faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Politician',     status: 'Unknown' },
  { id: 'masamedda',     name: 'Mas Amedda',            species: 'Chagrian',      homeworld: 'Champala',    faction: 'Republic',        era: 'Prequel Era',    forceUser: 'no',  role: 'Politician',     status: 'Alive' },
  { id: 'cham',          name: 'Cham Syndulla',          species: "Twi'lek",       homeworld: 'Ryloth',      faction: 'Rebel Alliance',  era: 'Clone Wars',     forceUser: 'no',  role: 'Leader',         status: 'Alive' },
  { id: 'bendu',         name: 'Bendu',                 species: 'Unknown',       homeworld: 'Atollon',     faction: 'Neutral',         era: 'Between Eras',   forceUser: 'yes', role: 'Master',         status: 'Unknown' },
  { id: 'seventhsis',    name: 'Seventh Sister',        species: 'Mirialan',      homeworld: 'Mirial',      faction: 'Galactic Empire', era: 'Between Eras',   forceUser: 'yes', role: 'Warrior',        status: 'Dead' },
  { id: 'numa',           name: 'Numa',                  species: "Twi'lek",       homeworld: 'Ryloth',      faction: 'Rebel Alliance',  era: 'Clone Wars',     forceUser: 'no',  role: 'Warrior',        status: 'Alive' },
];

// ---------------------------------------------------------------------------
// Build the ZZStructure
// ---------------------------------------------------------------------------
export function buildStarWarsStructure(): ZZStructure {
  const zz = new ZZStructure();

  // =========================================================================
  // 1. Define dimensions
  // =========================================================================
  zz.addDimension({ name: 'd.name',      color: '#4fc3f7', description: 'Alphabetical ordering of all characters' });
  zz.addDimension({ name: 'd.faction',   color: '#ff5252', description: 'Political/military faction allegiance' });
  zz.addDimension({ name: 'd.species',   color: '#69f0ae', description: 'Biological species classification' });
  zz.addDimension({ name: 'd.homeworld', color: '#b388ff', description: 'Planet of origin' });
  zz.addDimension({ name: 'd.era',       color: '#ffab40', description: 'Primary era of activity' });
  zz.addDimension({ name: 'd.force',     color: '#ffd740', description: 'Force sensitivity' });
  zz.addDimension({ name: 'd.role',      color: '#00e5ff', description: 'Primary role or occupation' });
  zz.addDimension({ name: 'd.status',    color: '#ff80ab', description: 'Alive, Dead, or Unknown status' });

  // =========================================================================
  // 2. Add all cells
  // =========================================================================
  for (const c of characters) {
    zz.addCell({
      id: c.id,
      label: c.name,
      properties: {
        name:      c.name,
        species:   c.species,
        homeworld: c.homeworld,
        faction:   c.faction,
        era:       c.era,
        forceUser: c.forceUser,
        role:      c.role,
        status:    c.status,
      },
    });
  }

  // =========================================================================
  // 3. Build ranks
  // =========================================================================

  // ---- d.name: one big alphabetical chain ----
  const alphabetical = [...characters]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => c.id);
  zz.buildRank('d.name', alphabetical);

  // ---- Helper: group characters by a property, then build a rank per group ----
  function buildGroupedRanks(dimName: string, key: keyof SWCharacter) {
    const groups = new Map<string, string[]>();
    for (const c of characters) {
      const val = c[key];
      if (!groups.has(val)) groups.set(val, []);
      groups.get(val)!.push(c.id);
    }
    for (const ids of groups.values()) {
      if (ids.length > 1) {
        zz.buildRank(dimName, ids);
      }
    }
  }

  // ---- d.faction ----
  buildGroupedRanks('d.faction', 'faction');

  // ---- d.species ----
  buildGroupedRanks('d.species', 'species');

  // ---- d.homeworld ----
  buildGroupedRanks('d.homeworld', 'homeworld');

  // ---- d.era ----
  buildGroupedRanks('d.era', 'era');

  // ---- d.force: two groups ----
  const forceSensitive = characters.filter(c => c.forceUser === 'yes').map(c => c.id);
  const nonForce       = characters.filter(c => c.forceUser === 'no').map(c => c.id);
  zz.buildRank('d.force', forceSensitive);
  zz.buildRank('d.force', nonForce);

  // ---- d.role ----
  buildGroupedRanks('d.role', 'role');

  // ---- d.status ----
  buildGroupedRanks('d.status', 'status');

  return zz;
}
