/**
 * Bangladesh 64 Districts and their Upazilas / Thanas
 */

export interface DistrictData {
  name: string;
  bnName: string;
  division: string;
  upazilas: string[];
}

export const BD_DISTRICTS: DistrictData[] = [
  // DHAKA DIVISION
  {
    name: 'Dhaka',
    bnName: 'ঢাকা',
    division: 'Dhaka',
    upazilas: ['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Mohammadpur', 'Savar', 'Dhamrai', 'Keraniganj', 'Nawabganj', 'Dohar', 'Banani', 'Badda', 'Tejgaon', 'Motijheel', 'Jatrabari', 'Old Dhaka']
  },
  {
    name: 'Gazipur',
    bnName: 'গাজীপুর',
    division: 'Dhaka',
    upazilas: ['Gazipur Sadar', 'Kaliakair', 'Sreepur', 'Kapasia', 'Kaliganj', 'Tongi']
  },
  {
    name: 'Narayanganj',
    bnName: 'নারায়ণগঞ্জ',
    division: 'Dhaka',
    upazilas: ['Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon']
  },
  {
    name: 'Tangail',
    bnName: 'টাঙ্গাইল',
    division: 'Dhaka',
    upazilas: ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari']
  },
  {
    name: 'Faridpur',
    bnName: 'ফরিদপুর',
    division: 'Dhaka',
    upazilas: ['Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrashen', 'Modhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha']
  },
  {
    name: 'Manikganj',
    bnName: 'মানিকগঞ্জ',
    division: 'Dhaka',
    upazilas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Ghior', 'Shibalaya', 'Harirampur', 'Daulatpur']
  },
  {
    name: 'Munshiganj',
    bnName: 'মুন্সীগঞ্জ',
    division: 'Dhaka',
    upazilas: ['Munshiganj Sadar', 'Gazaria', 'Tongibari', 'Sirajdikhan', 'Lohajang', 'Sreenagar']
  },
  {
    name: 'Narsingdi',
    bnName: 'নরসিংদী',
    division: 'Dhaka',
    upazilas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur']
  },
  {
    name: 'Rajbari',
    bnName: 'রাজবাড়ী',
    division: 'Dhaka',
    upazilas: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali']
  },
  {
    name: 'Madaripur',
    bnName: 'মাদারীপুর',
    division: 'Dhaka',
    upazilas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar']
  },
  {
    name: 'Gopalganj',
    bnName: 'গোপালগঞ্জ',
    division: 'Dhaka',
    upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara']
  },
  {
    name: 'Shariatpur',
    bnName: 'শরীয়তপুর',
    division: 'Dhaka',
    upazilas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Gosairhat', 'Bhedarganj', 'Damudya']
  },

  // CHATTOGRAM DIVISION
  {
    name: 'Chattogram',
    bnName: 'চট্টগ্রাম',
    division: 'Chattogram',
    upazilas: ['Chattogram Sadar', 'Hathazari', 'Sitakunda', 'Patiya', 'Mirsarai', 'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Lohagara', 'Raozan', 'Rangunia', 'Sandwip', 'Satkania']
  },
  {
    name: "Cox's Bazar",
    bnName: 'কক্সবাজার',
    division: 'Chattogram',
    upazilas: ['Coxs Bazar Sadar', 'Chakaria', 'Maheshkhali', 'Teknaf', 'Ukhia', 'Kutubdia', 'Pekua', 'Ramu']
  },
  {
    name: 'Cumilla',
    bnName: 'কুমিল্লা',
    division: 'Chattogram',
    upazilas: ['Cumilla Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Monohargonj', 'Meghna', 'Muradnagar', 'Nangalkot', 'Titas']
  },
  {
    name: 'Feni',
    bnName: 'ফেনী',
    division: 'Chattogram',
    upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi']
  },
  {
    name: 'Noakhali',
    bnName: 'নোয়াখালী',
    division: 'Chattogram',
    upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Subarnachar', 'Sonaimuri', 'Kabirhat']
  },
  {
    name: 'Brahmanbaria',
    bnName: 'ব্রাহ্মণবাড়িয়া',
    division: 'Chattogram',
    upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Banchharampur', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Akhaura', 'Bijoynagar']
  },
  {
    name: 'Chandpur',
    bnName: 'চাঁদপুর',
    division: 'Chattogram',
    upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti']
  },
  {
    name: 'Lakshmipur',
    bnName: 'লক্ষ্মীপুর',
    division: 'Chattogram',
    upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar']
  },
  {
    name: 'Rangamati',
    bnName: 'রাঙ্গামাটি',
    division: 'Chattogram',
    upazilas: ['Rangamati Sadar', 'Belaichhari', 'Baghaichhari', 'Barkal', 'Kaptai', 'Juraichhari', 'Langadu', 'Naniarchar', 'Rajasthali', 'Kawkhali']
  },
  {
    name: 'Bandarban',
    bnName: 'বান্দরবান',
    division: 'Chattogram',
    upazilas: ['Bandarban Sadar', 'Ali Kadam', 'Thanchi', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma']
  },
  {
    name: 'Khagrachhari',
    bnName: 'খাগড়াছড়ি',
    division: 'Chattogram',
    upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh']
  },

  // RAJSHAHI DIVISION
  {
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    division: 'Rajshahi',
    upazilas: ['Rajshahi Sadar', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore']
  },
  {
    name: 'Bogura',
    bnName: 'বগুড়া',
    division: 'Rajshahi',
    upazilas: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatala']
  },
  {
    name: 'Pabna',
    bnName: 'পাবনা',
    division: 'Rajshahi',
    upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar']
  },
  {
    name: 'Natore',
    bnName: 'নাটোর',
    division: 'Rajshahi',
    upazilas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga']
  },
  {
    name: 'Naogaon',
    bnName: 'নওগাঁ',
    division: 'Rajshahi',
    upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar', 'Mohadevpur']
  },
  {
    name: 'Sirajganj',
    bnName: 'সিরাজগঞ্জ',
    division: 'Rajshahi',
    upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Rayganj', 'Shahjadpur', 'Tarash', 'Ullapara']
  },
  {
    name: 'Joypurhat',
    bnName: 'জয়পুরহাট',
    division: 'Rajshahi',
    upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi']
  },
  {
    name: 'Chapainawabganj',
    bnName: 'চাঁপাইনবাবগঞ্জ',
    division: 'Rajshahi',
    upazilas: ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj']
  },

  // KHULNA DIVISION
  {
    name: 'Khulna',
    bnName: 'খুলনা',
    division: 'Khulna',
    upazilas: ['Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Sonadanga']
  },
  {
    name: 'Jashore',
    bnName: 'যশোর',
    division: 'Khulna',
    upazilas: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha']
  },
  {
    name: 'Kushtia',
    bnName: 'কুষ্টিয়া',
    division: 'Khulna',
    upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Daulatpur', 'Mirpur', 'Bheramara', 'Khoksa']
  },
  {
    name: 'Satkhira',
    bnName: 'সাতক্ষীরা',
    division: 'Khulna',
    upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala']
  },
  {
    name: 'Bagerhat',
    bnName: 'বাগেরহাট',
    division: 'Khulna',
    upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola']
  },
  {
    name: 'Jhenaidah',
    bnName: 'ঝিনাইদহ',
    division: 'Khulna',
    upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa']
  },
  {
    name: 'Chuadanga',
    bnName: 'চুয়াডাঙ্গা',
    division: 'Khulna',
    upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhida', 'Jibannagar']
  },
  {
    name: 'Meherpur',
    bnName: 'মেহেরপুর',
    division: 'Khulna',
    upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar']
  },
  {
    name: 'Narail',
    bnName: 'নড়াইল',
    division: 'Khulna',
    upazilas: ['Narail Sadar', 'Kalia', 'Lohagara']
  },
  {
    name: 'Magura',
    bnName: 'মাগুরা',
    division: 'Khulna',
    upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur']
  },

  // BARISHAL DIVISION
  {
    name: 'Barishal',
    bnName: 'বরিশাল',
    division: 'Barishal',
    upazilas: ['Barishal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur']
  },
  {
    name: 'Bhola',
    bnName: 'ভোলা',
    division: 'Barishal',
    upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin']
  },
  {
    name: 'Patuakhali',
    bnName: 'পটুয়াখালী',
    division: 'Barishal',
    upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali']
  },
  {
    name: 'Pirojpur',
    bnName: 'পিরোজপুর',
    division: 'Barishal',
    upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar']
  },
  {
    name: 'Barguna',
    bnName: 'বরগুনা',
    division: 'Barishal',
    upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali']
  },
  {
    name: 'Jhalokathi',
    bnName: 'ঝালকাঠি',
    division: 'Barishal',
    upazilas: ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur']
  },

  // SYLHET DIVISION
  {
    name: 'Sylhet',
    bnName: 'সিলেট',
    division: 'Sylhet',
    upazilas: ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'South Surma', 'Osmani Nagar']
  },
  {
    name: 'Moulvibazar',
    bnName: 'মৌলভীবাজার',
    division: 'Sylhet',
    upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal']
  },
  {
    name: 'Habiganj',
    bnName: 'হবিগঞ্জ',
    division: 'Sylhet',
    upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Baniachang', 'Bahubal', 'Chhatak', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj']
  },
  {
    name: 'Sunamganj',
    bnName: 'সুনামগঞ্জ',
    division: 'Sylhet',
    upazilas: ['Sunamganj Sadar', 'Bishwamambharpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'South Sunamganj']
  },

  // RANGPUR DIVISION
  {
    name: 'Rangpur',
    bnName: 'রংপুর',
    division: 'Rangpur',
    upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj']
  },
  {
    name: 'Dinajpur',
    bnName: 'দিনাজপুর',
    division: 'Rangpur',
    upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur']
  },
  {
    name: 'Gaibandha',
    bnName: 'গাইবান্ধা',
    division: 'Rangpur',
    upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj']
  },
  {
    name: 'Kurigram',
    bnName: 'কুড়িগ্রাম',
    division: 'Rangpur',
    upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur']
  },
  {
    name: 'Lalmonirhat',
    bnName: 'লালমনিরহাট',
    division: 'Rangpur',
    upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram']
  },
  {
    name: 'Nilphamari',
    bnName: 'নীলফামারী',
    division: 'Rangpur',
    upazilas: ['Nilphamari Sadar', 'Jaldhaka', 'Kishoreganj', 'Domar', 'Dimla', 'Saidpur']
  },
  {
    name: 'Panchagarh',
    bnName: 'পঞ্চগড়',
    division: 'Rangpur',
    upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia']
  },
  {
    name: 'Thakurgaon',
    bnName: 'ঠাকুরগাঁও',
    division: 'Rangpur',
    upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail']
  },

  // MYMENSINGH DIVISION
  {
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    division: 'Mymensingh',
    upazilas: ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gafargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'TaraKanda']
  },
  {
    name: 'Jamalpur',
    bnName: 'জামালপুর',
    division: 'Jamalpur',
    upazilas: ['Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Isampur', 'Madarganj', 'Melandaha', 'Sarishabari']
  },
  {
    name: 'Netrokona',
    bnName: 'নেত্রকোণা',
    division: 'Netrokona',
    upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendra', 'Madan', 'Mohanganj', 'Purbadhala']
  },
  {
    name: 'Sherpur',
    bnName: 'শেরপুর',
    division: 'Sherpur',
    upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi']
  }
];
