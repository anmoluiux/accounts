/**
 * ISO 3166-1 countries with their ITU calling codes.
 *
 * Generated from the mledoze/countries dataset, not hand-typed — 248 dial codes
 * are too many to get right by hand, and a wrong one is invisible until a real
 * customer in that country cannot sign up.
 *
 * Two corrections were applied on top of the raw `idd` fields, both verified
 * against the generated output:
 *
 *  1. `idd.suffixes` holds ONE entry for most countries (root + suffix is the
 *     code) but not for nine of them, where it lists area codes instead: the
 *     NANP block (US has 380 of them, CA 62, DO 3, PR 2), RU and KZ under +7,
 *     SH (+290 and +247 are genuinely two codes), EH and VA. Taking the root
 *     alone there produced nonsense like "+2" for Saint Helena. Those nine are
 *     pinned explicitly.
 *  2. Thirteen codes are shared by several territories, so a stored "+44…"
 *     cannot say which one was picked. Each shared code names one primary — the
 *     main territory — flagged `p` below. Without it, +44 read back as
 *     Guernsey and a search for "44" ranked Guernsey, the Isle of Man and
 *     Jersey above the United Kingdom.
 *
 * Keys are single letters deliberately: this array ships inside the step-2
 * chunk, and `name`/`iso2`/`dial` spelled out 248 times costs a few KB for
 * nothing the reader gains.
 *
 * Flags are NOT stored — they are derived from the ISO code at render time by
 * `flagSrc` below, which points at the vendored SVGs in `public/flags`.
 */
export type Country = {
  /** Common English name, e.g. "India". */
  n: string;
  /** ISO 3166-1 alpha-2 code, e.g. "IN". */
  c: string;
  /** Calling code including the plus, e.g. "+91". */
  d: string;
  /**
   * A real, valid example MOBILE number for this country — national part only,
   * digits only: "8123456789" for India, "2015550123" for the US. It is the
   * field's placeholder, so it changes with the flag and shows the right length.
   *
   * Lifted from the `examples.mobile.json` shipped by libphonenumber-js at
   * generation time rather than by depending on the library: the placeholder
   * needs one short string per country, not a ~145 KB metadata bundle and a
   * formatter at runtime.
   *
   * Digits only is deliberate. The input strips everything else, so a
   * placeholder written "(201) 555-0123" would promise formatting the field
   * does not actually do.
   *
   * Absent for the few territories libphonenumber has no example number for.
   */
  e?: string;
  /**
   * Space-joined lowercase aliases: the ISO-3 code plus the dataset's ASCII
   * alternative spellings, so "uae", "uk", "usa" and "holland" find their
   * country. Non-Latin spellings are dropped — they are most of the raw list by
   * volume and nobody types them into an English funnel.
   */
  a?: string;
  /** 1 when this is the main territory for a dial code several countries share. */
  p?: 1;
};

export const COUNTRIES: Country[] = [
  { n: "Afghanistan", c: "AF", d: "+93", e: "701234567" },
  { n: "Åland Islands", c: "AX", d: "+35818", e: "412345678", a: "ala aaland aland ahvenanmaa" },
  { n: "Albania", c: "AL", d: "+355", e: "672123456", a: "shqipnia" },
  { n: "Algeria", c: "DZ", d: "+213", e: "551234567", a: "dza dzayer" },
  { n: "American Samoa", c: "AS", d: "+1684", e: "6847331234", a: "asm" },
  { n: "Andorra", c: "AD", d: "+376", e: "312345", a: "principality of andorra principat d'andorra" },
  { n: "Angola", c: "AO", d: "+244", e: "923123456", a: "ago" },
  { n: "Anguilla", c: "AI", d: "+1264", e: "2642351234", a: "aia" },
  { n: "Antigua and Barbuda", c: "AG", d: "+1268", e: "2684641234", a: "atg" },
  { n: "Argentina", c: "AR", d: "+54", e: "91123456789", a: "argentine republic" },
  { n: "Armenia", c: "AM", d: "+374", e: "77123456", a: "hayastan republic of armenia" },
  { n: "Aruba", c: "AW", d: "+297", e: "5601234", a: "abw" },
  { n: "Australia", c: "AU", d: "+61", e: "412345678", p: 1 },
  { n: "Austria", c: "AT", d: "+43", e: "664123456", a: "aut osterreich oesterreich" },
  { n: "Azerbaijan", c: "AZ", d: "+994", e: "401234567", a: "republic of azerbaijan" },
  { n: "Bahamas", c: "BS", d: "+1242", e: "2423591234", a: "bhs commonwealth of the bahamas" },
  { n: "Bahrain", c: "BH", d: "+973", e: "36001234", a: "bhr kingdom of bahrain" },
  { n: "Bangladesh", c: "BD", d: "+880", e: "1812345678", a: "bgd people's republic of bangladesh" },
  { n: "Barbados", c: "BB", d: "+1246", e: "2462501234", a: "brb" },
  { n: "Belarus", c: "BY", d: "+375", e: "294911911", a: "blr republic of belarus" },
  { n: "Belgium", c: "BE", d: "+32", e: "450001234", a: "belgie belgien belgique kingdom of belgium royaume de belgique" },
  { n: "Belize", c: "BZ", d: "+501", e: "6221234", a: "blz" },
  { n: "Benin", c: "BJ", d: "+229", e: "0195123456", a: "republic of benin" },
  { n: "Bermuda", c: "BM", d: "+1441", e: "4413701234", a: "bmu the islands of bermuda the bermudas somers isles" },
  { n: "Bhutan", c: "BT", d: "+975", e: "17123456", a: "btn kingdom of bhutan" },
  { n: "Bolivia", c: "BO", d: "+591", e: "71234567", a: "buliwya wuliwya bolivia, plurinational state of plurinational state of bolivia estado plurinacional de bolivia buliwya mamallaqta wuliwya suyu" },
  { n: "Bosnia and Herzegovina", c: "BA", d: "+387", e: "61123456", a: "bih bosnia-herzegovina" },
  { n: "Botswana", c: "BW", d: "+267", e: "71123456", a: "bwa republic of botswana lefatshe la botswana" },
  { n: "Bouvet Island", c: "BV", d: "+47", a: "bvt" },
  { n: "Brazil", c: "BR", d: "+55", e: "11961234567", a: "brasil federative republic of brazil" },
  { n: "British Indian Ocean Territory", c: "IO", d: "+246", e: "3801234", a: "iot" },
  { n: "British Virgin Islands", c: "VG", d: "+1284", e: "2843001234", a: "vgb virgin islands, british" },
  { n: "Brunei", c: "BN", d: "+673", e: "7123456", a: "brn brunei darussalam nation of brunei the abode of peace" },
  { n: "Bulgaria", c: "BG", d: "+359", e: "43012345", a: "bgr republic of bulgaria" },
  { n: "Burkina Faso", c: "BF", d: "+226", e: "70123456", a: "bfa" },
  { n: "Burundi", c: "BI", d: "+257", e: "79561234", a: "bdi republic of burundi republika y'uburundi" },
  { n: "Cambodia", c: "KH", d: "+855", e: "91234567", a: "khm kingdom of cambodia" },
  { n: "Cameroon", c: "CM", d: "+237", e: "671234567", a: "cmr republic of cameroon" },
  { n: "Canada", c: "CA", d: "+1", e: "5062345678" },
  { n: "Cape Verde", c: "CV", d: "+238", e: "9911234", a: "cpv republic of cabo verde" },
  { n: "Caribbean Netherlands", c: "BQ", d: "+599", e: "3181234", a: "bes bes islands bonaire sint eustatius and saba" },
  { n: "Cayman Islands", c: "KY", d: "+1345", e: "3453231234", a: "cym" },
  { n: "Central African Republic", c: "CF", d: "+236", e: "70012345", a: "caf" },
  { n: "Chad", c: "TD", d: "+235", e: "63012345", a: "tcd tchad republic of chad" },
  { n: "Chile", c: "CL", d: "+56", e: "221234567", a: "chl republic of chile" },
  { n: "China", c: "CN", d: "+86", e: "13123456789", a: "chn zhongguo zhonghua people's republic of china" },
  { n: "Christmas Island", c: "CX", d: "+61", e: "412345678", a: "cxr territory of christmas island" },
  { n: "Cocos (Keeling) Islands", c: "CC", d: "+61", e: "412345678", a: "cck keeling islands cocos islands" },
  { n: "Colombia", c: "CO", d: "+57", e: "3211234567", a: "republic of colombia" },
  { n: "Comoros", c: "KM", d: "+269", e: "3212345", a: "union of the comoros union des comores udzima wa komori" },
  { n: "Congo", c: "CG", d: "+242", e: "061234567", a: "cog congo-brazzaville" },
  { n: "Cook Islands", c: "CK", d: "+682", e: "71234", a: "cok" },
  { n: "Costa Rica", c: "CR", d: "+506", e: "83123456", a: "cri republic of costa rica" },
  { n: "Croatia", c: "HR", d: "+385", e: "921234567", a: "hrv hrvatska republic of croatia republika hrvatska" },
  { n: "Cuba", c: "CU", d: "+53", e: "51234567", a: "republic of cuba" },
  { n: "Curaçao", c: "CW", d: "+599", e: "95181234", a: "cuw curacao", p: 1 },
  { n: "Cyprus", c: "CY", d: "+357", e: "96123456", a: "republic of cyprus" },
  { n: "Czechia", c: "CZ", d: "+420", e: "601123456" },
  { n: "Denmark", c: "DK", d: "+45", e: "34412345", a: "dnk danmark kingdom of denmark kongeriget danmark" },
  { n: "Djibouti", c: "DJ", d: "+253", e: "77831001", a: "jabuuti gabuuti republic of djibouti gabuutih ummuuno jamhuuriyadda jabuuti" },
  { n: "Dominica", c: "DM", d: "+1767", e: "7672251234", a: "dma dominique commonwealth of dominica" },
  { n: "Dominican Republic", c: "DO", d: "+1", e: "8092345678" },
  { n: "DR Congo", c: "CD", d: "+243", e: "991234567", a: "cod congo-kinshasa congo, the democratic republic of the democratic republic of congo drc" },
  { n: "Ecuador", c: "EC", d: "+593", e: "991234567", a: "republic of ecuador" },
  { n: "Egypt", c: "EG", d: "+20", e: "1001234567", a: "arab republic of egypt" },
  { n: "El Salvador", c: "SV", d: "+503", e: "70123456", a: "slv republic of el salvador" },
  { n: "Equatorial Guinea", c: "GQ", d: "+240", e: "222123456", a: "gnq republic of equatorial guinea" },
  { n: "Eritrea", c: "ER", d: "+291", e: "7123456", a: "state of eritrea" },
  { n: "Estonia", c: "EE", d: "+372", e: "51234567", a: "eesti republic of estonia eesti vabariik" },
  { n: "Eswatini", c: "SZ", d: "+268", e: "76123456", a: "swz swaziland weswatini ngwane kingdom of eswatini umbuso weswatini", p: 1 },
  { n: "Ethiopia", c: "ET", d: "+251", e: "911234567", a: "federal democratic republic of ethiopia" },
  { n: "Falkland Islands", c: "FK", d: "+500", e: "51234", a: "flk islas malvinas falkland islands (malvinas)", p: 1 },
  { n: "Faroe Islands", c: "FO", d: "+298", e: "211234", a: "fro faeroe islands" },
  { n: "Fiji", c: "FJ", d: "+679", e: "7012345", a: "fji viti republic of fiji matanitu ko viti" },
  { n: "Finland", c: "FI", d: "+358", e: "412345678", a: "suomi republic of finland suomen tasavalta republiken finland" },
  { n: "France", c: "FR", d: "+33", e: "612345678", a: "french republic" },
  { n: "French Guiana", c: "GF", d: "+594", e: "694201234", a: "guf guyane" },
  { n: "French Polynesia", c: "PF", d: "+689", e: "87123456", a: "pyf" },
  { n: "French Southern and Antarctic Lands", c: "TF", d: "+262", a: "atf french southern territories" },
  { n: "Gabon", c: "GA", d: "+241", e: "06031234", a: "gabonese republic" },
  { n: "Gambia", c: "GM", d: "+220", e: "3012345", a: "gmb republic of the gambia" },
  { n: "Georgia", c: "GE", d: "+995", e: "555123456", a: "sakartvelo" },
  { n: "Germany", c: "DE", d: "+49", e: "15123456789", a: "deu federal republic of germany bundesrepublik deutschland" },
  { n: "Ghana", c: "GH", d: "+233", e: "231234567" },
  { n: "Gibraltar", c: "GI", d: "+350", e: "57123456" },
  { n: "Greece", c: "GR", d: "+30", e: "6912345678", a: "grc hellenic republic" },
  { n: "Greenland", c: "GL", d: "+299", e: "221234", a: "grl" },
  { n: "Grenada", c: "GD", d: "+1473", e: "4734031234", a: "grd" },
  { n: "Guadeloupe", c: "GP", d: "+590", e: "690001234", a: "glp gwadloup", p: 1 },
  { n: "Guam", c: "GU", d: "+1671", e: "6713001234", a: "gum" },
  { n: "Guatemala", c: "GT", d: "+502", e: "51234567", a: "gtm" },
  { n: "Guernsey", c: "GG", d: "+44", e: "7781123456", a: "ggy bailiwick of guernsey bailliage de guernesey" },
  { n: "Guinea", c: "GN", d: "+224", e: "601123456", a: "gin republic of guinea" },
  { n: "Guinea-Bissau", c: "GW", d: "+245", e: "955012345", a: "gnb republic of guinea-bissau" },
  { n: "Guyana", c: "GY", d: "+592", e: "6091234", a: "co-operative republic of guyana" },
  { n: "Haiti", c: "HT", d: "+509", e: "34101234", a: "hti republic of haiti repiblik ayiti" },
  { n: "Honduras", c: "HN", d: "+504", e: "91234567", a: "hnd republic of honduras" },
  { n: "Hong Kong", c: "HK", d: "+852", e: "51234567", a: "hkg" },
  { n: "Hungary", c: "HU", d: "+36", e: "201234567" },
  { n: "Iceland", c: "IS", d: "+354", e: "6111234", a: "isl island republic of iceland" },
  { n: "India", c: "IN", d: "+91", e: "8123456789", a: "republic of india bharat ganrajya" },
  { n: "Indonesia", c: "ID", d: "+62", e: "812345678", a: "idn republic of indonesia republik indonesia" },
  { n: "Iran", c: "IR", d: "+98", e: "9123456789", a: "irn islamic republic of iran iran, islamic republic of" },
  { n: "Iraq", c: "IQ", d: "+964", e: "7912345678", a: "irq republic of iraq" },
  { n: "Ireland", c: "IE", d: "+353", e: "850123456", a: "irl republic of ireland" },
  { n: "Isle of Man", c: "IM", d: "+44", e: "7924123456", a: "imn ellan vannin mann mannin" },
  { n: "Israel", c: "IL", d: "+972", e: "502345678", a: "state of israel" },
  { n: "Italy", c: "IT", d: "+39", e: "3123456789", a: "italian republic repubblica italiana", p: 1 },
  { n: "Ivory Coast", c: "CI", d: "+225", e: "0123456789", a: "civ cote d'ivoire" },
  { n: "Jamaica", c: "JM", d: "+1876", e: "8762101234" },
  { n: "Japan", c: "JP", d: "+81", e: "9012345678", a: "jpn nippon nihon" },
  { n: "Jersey", c: "JE", d: "+44", e: "7797712345", a: "jey bailiwick of jersey bailliage de jersey" },
  { n: "Jordan", c: "JO", d: "+962", e: "790123456", a: "hashemite kingdom of jordan" },
  { n: "Kazakhstan", c: "KZ", d: "+7", e: "7710009998", a: "qazaqstan republic of kazakhstan respublika kazakhstan" },
  { n: "Kenya", c: "KE", d: "+254", e: "712123456", a: "republic of kenya jamhuri ya kenya" },
  { n: "Kiribati", c: "KI", d: "+686", e: "72001234", a: "republic of kiribati ribaberiki kiribati" },
  { n: "Kosovo", c: "XK", d: "+383", e: "43201234", a: "unk" },
  { n: "Kuwait", c: "KW", d: "+965", e: "50012345", a: "kwt state of kuwait dawlat al-kuwait" },
  { n: "Kyrgyzstan", c: "KG", d: "+996", e: "700123456", a: "kgz kyrgyz republic kyrgyz respublikasy" },
  { n: "Laos", c: "LA", d: "+856", e: "2023123456", a: "lao people's democratic republic sathalanalat paxathipatai paxaxon lao" },
  { n: "Latvia", c: "LV", d: "+371", e: "21234567", a: "lva republic of latvia latvijas republika" },
  { n: "Lebanon", c: "LB", d: "+961", e: "71123456", a: "lbn lebanese republic" },
  { n: "Lesotho", c: "LS", d: "+266", e: "50123456", a: "lso kingdom of lesotho muso oa lesotho" },
  { n: "Liberia", c: "LR", d: "+231", e: "770123456", a: "lbr republic of liberia" },
  { n: "Libya", c: "LY", d: "+218", e: "912345678", a: "lby state of libya dawlat libya" },
  { n: "Liechtenstein", c: "LI", d: "+423", e: "660234567", a: "principality of liechtenstein" },
  { n: "Lithuania", c: "LT", d: "+370", e: "61234567", a: "ltu republic of lithuania lietuvos respublika" },
  { n: "Luxembourg", c: "LU", d: "+352", e: "628123456", a: "grand duchy of luxembourg" },
  { n: "Macau", c: "MO", d: "+853", e: "66123456", a: "macao macao special administrative region of the people's republic of china" },
  { n: "Madagascar", c: "MG", d: "+261", e: "321234567", a: "mdg republic of madagascar repoblikan'i madagasikara" },
  { n: "Malawi", c: "MW", d: "+265", e: "991234567", a: "mwi republic of malawi" },
  { n: "Malaysia", c: "MY", d: "+60", e: "123456789", a: "mys" },
  { n: "Maldives", c: "MV", d: "+960", e: "7712345", a: "mdv maldive islands republic of the maldives dhivehi raajjeyge jumhooriyya" },
  { n: "Mali", c: "ML", d: "+223", e: "65012345", a: "mli republic of mali" },
  { n: "Malta", c: "MT", d: "+356", e: "96961234", a: "mlt republic of malta repubblika ta' malta" },
  { n: "Marshall Islands", c: "MH", d: "+692", e: "2351234", a: "mhl republic of the marshall islands" },
  { n: "Martinique", c: "MQ", d: "+596", e: "696201234", a: "mtq" },
  { n: "Mauritania", c: "MR", d: "+222", e: "22123456", a: "mrt islamic republic of mauritania" },
  { n: "Mauritius", c: "MU", d: "+230", e: "52512345", a: "mus republic of mauritius" },
  { n: "Mayotte", c: "YT", d: "+262", e: "639012345", a: "myt department of mayotte" },
  { n: "Mexico", c: "MX", d: "+52", e: "2221234567", a: "mexicanos united mexican states estados unidos mexicanos" },
  { n: "Micronesia", c: "FM", d: "+691", e: "3501234", a: "fsm federated states of micronesia micronesia, federated states of" },
  { n: "Moldova", c: "MD", d: "+373", e: "62112345", a: "mda moldova, republic of republic of moldova republica moldova" },
  { n: "Monaco", c: "MC", d: "+377", e: "612345678", a: "mco principality of monaco" },
  { n: "Mongolia", c: "MN", d: "+976", e: "88123456", a: "mng" },
  { n: "Montenegro", c: "ME", d: "+382", e: "60123456", a: "mne crna gora" },
  { n: "Montserrat", c: "MS", d: "+1664", e: "6644923456", a: "msr" },
  { n: "Morocco", c: "MA", d: "+212", e: "650123456", a: "mar kingdom of morocco", p: 1 },
  { n: "Mozambique", c: "MZ", d: "+258", e: "821234567", a: "republic of mozambique" },
  { n: "Myanmar", c: "MM", d: "+95", e: "92123456", a: "mmr burma republic of the union of myanmar" },
  { n: "Namibia", c: "NA", d: "+264", e: "811234567", a: "republic of namibia" },
  { n: "Nauru", c: "NR", d: "+674", e: "5551234", a: "nru naoero pleasant island republic of nauru ripublik naoero" },
  { n: "Nepal", c: "NP", d: "+977", e: "9841234567", a: "npl federal democratic republic of nepal" },
  { n: "Netherlands", c: "NL", d: "+31", e: "612345678", a: "nld holland nederland the netherlands" },
  { n: "New Caledonia", c: "NC", d: "+687", e: "751234", a: "ncl" },
  { n: "New Zealand", c: "NZ", d: "+64", e: "211234567", a: "nzl aotearoa", p: 1 },
  { n: "Nicaragua", c: "NI", d: "+505", e: "81234567", a: "republic of nicaragua" },
  { n: "Niger", c: "NE", d: "+227", e: "93123456", a: "ner nijar" },
  { n: "Nigeria", c: "NG", d: "+234", e: "8021234567", a: "nga nijeriya federal republic of nigeria" },
  { n: "Niue", c: "NU", d: "+683", e: "8884012" },
  { n: "Norfolk Island", c: "NF", d: "+672", e: "381234", a: "nfk territory of norfolk island teratri of norf'k ailen" },
  { n: "North Korea", c: "KP", d: "+850", e: "1921234567", a: "prk democratic people's republic of korea dprk korea, democratic people's republic of" },
  { n: "North Macedonia", c: "MK", d: "+389", e: "72345678", a: "mkd the former yugoslav republic of macedonia republic of north macedonia macedonia, the former yugoslav republic of" },
  { n: "Northern Mariana Islands", c: "MP", d: "+1670", e: "6702345678", a: "mnp commonwealth of the northern mariana islands" },
  { n: "Norway", c: "NO", d: "+47", e: "40612345", a: "norge noreg kingdom of norway kongeriket norge kongeriket noreg", p: 1 },
  { n: "Oman", c: "OM", d: "+968", e: "92123456", a: "omn sultanate of oman" },
  { n: "Pakistan", c: "PK", d: "+92", e: "3012345678", a: "islamic republic of pakistan" },
  { n: "Palau", c: "PW", d: "+680", e: "6201234", a: "plw republic of palau beluu er a belau" },
  { n: "Palestine", c: "PS", d: "+970", e: "599123456", a: "pse palestine, state of state of palestine" },
  { n: "Panama", c: "PA", d: "+507", e: "61234567", a: "republic of panama" },
  { n: "Papua New Guinea", c: "PG", d: "+675", e: "70123456", a: "png independent state of papua new guinea independen stet bilong papua niugini" },
  { n: "Paraguay", c: "PY", d: "+595", e: "961456789", a: "pry republic of paraguay" },
  { n: "Peru", c: "PE", d: "+51", e: "912345678", a: "republic of peru" },
  { n: "Philippines", c: "PH", d: "+63", e: "9051234567", a: "phl republic of the philippines" },
  { n: "Pitcairn Islands", c: "PN", d: "+64", a: "pcn pitcairn henderson ducie and oeno islands" },
  { n: "Poland", c: "PL", d: "+48", e: "512345678", a: "republic of poland rzeczpospolita polska" },
  { n: "Portugal", c: "PT", d: "+351", e: "912345678", a: "prt portuguesa portuguese republic" },
  { n: "Puerto Rico", c: "PR", d: "+1", e: "7872345678", a: "pri commonwealth of puerto rico estado libre asociado de puerto rico" },
  { n: "Qatar", c: "QA", d: "+974", e: "33123456", a: "state of qatar" },
  { n: "Réunion", c: "RE", d: "+262", e: "692123456", a: "reu reunion", p: 1 },
  { n: "Romania", c: "RO", d: "+40", e: "712034567", a: "rou rumania roumania" },
  { n: "Russia", c: "RU", d: "+7", e: "9123456789", a: "russian federation", p: 1 },
  { n: "Rwanda", c: "RW", d: "+250", e: "720123456", a: "republic of rwanda repubulika y'u rwanda" },
  { n: "Saint Barthélemy", c: "BL", d: "+590", e: "690001234", a: "blm st. barthelemy" },
  { n: "Saint Helena, Ascension and Tristan da Cunha", c: "SH", d: "+290", e: "51234", a: "shn st. helena, ascension and tristan da cunha" },
  { n: "Saint Kitts and Nevis", c: "KN", d: "+1869", e: "8697652917", a: "kna federation of saint christopher and nevis" },
  { n: "Saint Lucia", c: "LC", d: "+1758", e: "7582845678", a: "lca" },
  { n: "Saint Martin", c: "MF", d: "+590", e: "690001234", a: "maf collectivity of saint martin saint martin (french part)" },
  { n: "Saint Pierre and Miquelon", c: "PM", d: "+508", e: "551234", a: "spm" },
  { n: "Saint Vincent and the Grenadines", c: "VC", d: "+1784", e: "7844301234", a: "vct" },
  { n: "Samoa", c: "WS", d: "+685", e: "7212345", a: "wsm independent state of samoa" },
  { n: "San Marino", c: "SM", d: "+378", e: "66661212", a: "smr republic of san marino repubblica di san marino" },
  { n: "São Tomé and Príncipe", c: "ST", d: "+239", e: "9812345", a: "stp sao tome and principe" },
  { n: "Saudi Arabia", c: "SA", d: "+966", e: "512345678", a: "kingdom of saudi arabia" },
  { n: "Senegal", c: "SN", d: "+221", e: "701234567", a: "republic of senegal" },
  { n: "Serbia", c: "RS", d: "+381", e: "601234567", a: "srb srbija republika srbija republic of serbia" },
  { n: "Seychelles", c: "SC", d: "+248", e: "2510123", a: "syc republic of seychelles repiblik sesel" },
  { n: "Sierra Leone", c: "SL", d: "+232", e: "25123456", a: "sle republic of sierra leone" },
  { n: "Singapore", c: "SG", d: "+65", e: "81234567", a: "sgp singapura republik singapura" },
  { n: "Sint Maarten", c: "SX", d: "+1721", e: "7215205678", a: "sxm sint maarten (dutch part)" },
  { n: "Slovakia", c: "SK", d: "+421", e: "912123456", a: "svk slovak republic" },
  { n: "Slovenia", c: "SI", d: "+386", e: "31234567", a: "svn republic of slovenia republika slovenija" },
  { n: "Solomon Islands", c: "SB", d: "+677", e: "7421234", a: "slb" },
  { n: "Somalia", c: "SO", d: "+252", e: "71123456", a: "federal republic of somalia jamhuuriyadda federaalka soomaaliya" },
  { n: "South Africa", c: "ZA", d: "+27", e: "711234567", a: "zaf rsa suid-afrika republic of south africa" },
  { n: "South Georgia", c: "GS", d: "+500", a: "sgs south georgia and the south sandwich islands" },
  { n: "South Korea", c: "KR", d: "+82", e: "1020000000", a: "korea, republic of republic of korea" },
  { n: "South Sudan", c: "SS", d: "+211", e: "977123456", a: "ssd" },
  { n: "Spain", c: "ES", d: "+34", e: "612345678", a: "esp kingdom of spain" },
  { n: "Sri Lanka", c: "LK", d: "+94", e: "712345678", a: "lka democratic socialist republic of sri lanka" },
  { n: "Sudan", c: "SD", d: "+249", e: "911231234", a: "sdn republic of the sudan" },
  { n: "Suriname", c: "SR", d: "+597", e: "7412345", a: "sarnam sranangron republic of suriname republiek suriname" },
  { n: "Svalbard and Jan Mayen", c: "SJ", d: "+4779", e: "41234567", a: "sjm svalbard and jan mayen islands" },
  { n: "Sweden", c: "SE", d: "+46", e: "701234567", a: "kingdom of sweden konungariket sverige" },
  { n: "Switzerland", c: "CH", d: "+41", e: "781234567", a: "che swiss confederation schweiz suisse svizzera svizra" },
  { n: "Syria", c: "SY", d: "+963", e: "944567890", a: "syrian arab republic" },
  { n: "Taiwan", c: "TW", d: "+886", e: "912345678", a: "twn republic of china chinese taipei" },
  { n: "Tajikistan", c: "TJ", d: "+992", e: "917123456", a: "tjk republic of tajikistan" },
  { n: "Tanzania", c: "TZ", d: "+255", e: "621234567", a: "tza tanzania, united republic of united republic of tanzania jamhuri ya muungano wa tanzania" },
  { n: "Thailand", c: "TH", d: "+66", e: "812345678", a: "prathet kingdom of thailand ratcha anachak thai" },
  { n: "Timor-Leste", c: "TL", d: "+670", e: "77212345", a: "tls east timor democratic republic of timor-leste timor lorosae" },
  { n: "Togo", c: "TG", d: "+228", e: "90112345", a: "tgo togolese togolese republic" },
  { n: "Tokelau", c: "TK", d: "+690", e: "7290", a: "tkl" },
  { n: "Tonga", c: "TO", d: "+676", e: "7715123" },
  { n: "Trinidad and Tobago", c: "TT", d: "+1868", e: "8682911234", a: "tto republic of trinidad and tobago" },
  { n: "Tunisia", c: "TN", d: "+216", e: "20123456", a: "republic of tunisia" },
  { n: "Türkiye", c: "TR", d: "+90", e: "5012345678", a: "tur turkiye republic of turkey" },
  { n: "Turkmenistan", c: "TM", d: "+993", e: "66123456", a: "tkm" },
  { n: "Turks and Caicos Islands", c: "TC", d: "+1649", e: "6492311234", a: "tca" },
  { n: "Tuvalu", c: "TV", d: "+688", e: "901234" },
  { n: "Uganda", c: "UG", d: "+256", e: "712345678", a: "republic of uganda jamhuri ya uganda" },
  { n: "Ukraine", c: "UA", d: "+380", e: "501234567", a: "ukrayina" },
  { n: "United Arab Emirates", c: "AE", d: "+971", e: "501234567", a: "are uae" },
  { n: "United Kingdom", c: "GB", d: "+44", e: "7400123456", a: "gbr uk great britain", p: 1 },
  { n: "United States", c: "US", d: "+1", e: "2015550123", a: "usa united states of america", p: 1 },
  { n: "United States Minor Outlying Islands", c: "UM", d: "+268", a: "umi" },
  { n: "United States Virgin Islands", c: "VI", d: "+1340", e: "3406421234", a: "virgin islands, u.s." },
  { n: "Uruguay", c: "UY", d: "+598", e: "94231234", a: "ury oriental republic of uruguay" },
  { n: "Uzbekistan", c: "UZ", d: "+998", e: "912345678", a: "republic of uzbekistan" },
  { n: "Vanuatu", c: "VU", d: "+678", e: "5912345", a: "vut republic of vanuatu ripablik blong vanuatu" },
  { n: "Vatican City", c: "VA", d: "+39", e: "3123456789", a: "holy see (vatican city state) vatican city state" },
  { n: "Venezuela", c: "VE", d: "+58", e: "4121234567", a: "bolivarian republic of venezuela venezuela, bolivarian republic of" },
  { n: "Vietnam", c: "VN", d: "+84", e: "912345678", a: "vnm socialist republic of vietnam viet nam" },
  { n: "Wallis and Futuna", c: "WF", d: "+681", e: "821234", a: "wlf territory of the wallis and futuna islands" },
  { n: "Western Sahara", c: "EH", d: "+212", e: "650123456", a: "esh" },
  { n: "Yemen", c: "YE", d: "+967", e: "712345678", a: "yemeni republic" },
  { n: "Zambia", c: "ZM", d: "+260", e: "955123456", a: "zmb republic of zambia" },
  { n: "Zimbabwe", c: "ZW", d: "+263", e: "712345678", a: "zwe republic of zimbabwe" },
];

/**
 * "IN" -> "/flags/in.svg"
 *
 * Flags are vendored SVGs in `public/flags`, NOT emoji. Emoji flags are free and
 * were the first attempt, but Windows ships no flag glyphs in Segoe UI Emoji, so
 * Chrome and Edge on Windows render the bare ISO letters — which is most of the
 * audience seeing "IN" where a flag should be. No CSS or font stack fixes that
 * from the emoji side.
 *
 * The files are the 4x3 set from `flag-icons` (MIT; the flags themselves are
 * public domain), copied in rather than added as a dependency: only the 248
 * countries listed here are needed, and vendoring keeps a static export free of
 * a node_modules asset pipeline. Already minified at source — svgo finds 0% to
 * remove. Median file is under 1 KB; the handful of coat-of-arms flags that run
 * to ~100 KB are only fetched if that row is actually on screen, since each is a
 * separate request made by the browser as it renders.
 */
export function flagSrc(iso2: string): string {
  return `/flags/${iso2.toLowerCase()}.svg`;
}
