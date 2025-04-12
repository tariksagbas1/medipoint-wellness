const itemModal = document.getElementById('addItemModal');
const categoryModal = document.getElementById('addCategoryModal');
const addItemBtn = document.getElementById('addItemBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const closeItemModal = document.getElementById('closeModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const addItemForm = document.getElementById('addItemForm');
const addCategoryForm = document.getElementById('addCategoryForm');

const menuData = [
  {
    name: 'Glutensiz Yemekler',
    items: [
      {
        name: 'Glutensiz Domates Soslu Fusilli Makarna',
        description: 'Karabuğday makarna, tereyağı, domates sosu, rendelenmiş kaşar peyniri',
        price: '390',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/38777702.jpg??width=400'
      },
      {
        name: 'Somon Bruschetta',
        description: 'Zerun ekmek üzerine; somon füme, maskolin, dip sos, soğan turşusu',
        price: '350',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/39849680.jpg??width=400'
      },
      {
        name: 'Avokado Scramble',
        description: 'Scramble yumurta, avakado dilimleri, ekşi mayalı karabuğday ciabatta ekmeği',
        price: '390',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/39849879.jpg??width=400'
      },
      {
        name: 'Glutensiz Hamburger',
        description: 'Glutensiz karabuğday brioche ekmeği, 170 gr. dana eti burger köfte, marul, domates',
        price: '530',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/65636002.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday 3 Peynirli Tost',
        description: 'Glutensiz karabuğday ekmeğine; İzmir tulum peyniri, beyaz peynir, kaşar peyniri',
        price: '330',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/65636003.jpg??width=400'
      },
      {
        name: 'Glutensiz Cheeseburger',
        description: 'Glutensiz karabuğday brioche ekmeğinden yapılmıştır. 170 gr. dana eti burger köfte',
        price: '550',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/65636229.jpg??width=400'
      },
      {
        name: 'Glutensiz Sebzeli Humus Bowl',
        description: 'Ceviz, tahinli humus, karnabahar, brokoli, havuç',
        price: '450',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66231570.jpg??width=400'
      },
      {
        name: 'Glutensiz Tavuklu Wrap',
        description: '200gr tavuk. Salata, fırında patates ile (Çölyak hastaları için uygun değildir.)',
        price: '450',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66245342.jpg??width=400'
      },
      {
        name: 'Lahmacun (Glutensiz)',
        description: 'Glutensiz taban üzerine; dana kıyma, kırmızı lahana turşusu, soğan ile.',
        price: '330',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66969482.jpg??width=400'
      },
      {
        name: 'Glutensiz Sucuk Sever Pizza',
        description: 'Mozzarella peyniri, dana eti, mısır, 80gr 100% dana eti Kayseri sucuk',
        price: '460',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66970450.jpg??width=400'
      },
      {
        name: 'Glutensiz Anadolu Ateşi Pizza (22 cm)',
        description: 'Pizza tabanı; pizza sosu, mozzarella peyniri, 80 gr. dana kavurma, renkli biber',
        price: '490',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66970465.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday Tavuk Burger',
        description: '100gr Izgara tavuk, karamelize soğan, cheddar peyniri, domates, salatalık turşusu',
        price: '500',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67510776.jpg??width=400'
      },
      {
        name: 'Glutensiz Margherita Pizza',
        description: 'Domates sosu, mozzarella peyniri, fesleğen',
        price: '410',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66969940.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday Sucuklu 3 Peynirli Tost',
        description: 'Glutensiz karabuğday ekmeğine; 45gr 100% dana eti Kayseri sucuk, İzmir tulum peyniri, beyaz peynir',
        price: '380',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67626100.jpg??width=400'
      },
      {
        name: 'Glutensiz Kavurmalı Kaşar Peynirli Tost',
        description: 'Glutensiz karabuğday ekmeğine; 80gr dana kavurma, kaşar peyniri. Salata ile',
        price: '395',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/69254324.jpg??width=400'
      },
      {
        name: '4 Peynirli Karabuğdaylı Brioche Sandviç',
        description: 'Glutensiz karabuğday brioche ekmeğine; cheddar peyniri, çeçil peyniri, kaşar',
        price: '250',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/70692230.jpg??width=400'
      },
      {
        name: 'Doğal Akçaağaç Şuruplu Karabuğday Pancake',
        description: 'Akçaağaç şurubu, çikolata sos, orman meyveleri',
        price: '420',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/70704375.jpg??width=400'
      }
    ]
  },
  {
    name: 'Glutensiz Ürünler',
    items: [
      {
        name: 'Karabuğday Cookie Ice Latte (Glutensiz)',
        description: 'Glutensiz karabuğday çikolatalı cookie blenderdan geçirilip ice latteyle karıştırılır.',
        price: '280',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67062960.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday Simit',
        description: 'Adet olarak servis edilir. (Çölyaklara önerilmez)',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/40450093.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday Açma',
        description: 'Adet olarak servis edilir.',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/40450128.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğday Anne Poğaçası',
        description: 'Adet olarak servis edilir.',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/40454773.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğdaylı Chocolate Cookie',
        description: 'Çikolata, ceviz (Çölyak hastaları için uygun değildir.)',
        price: '190',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/40450799.jpg??width=400'
      },
      {
        name: 'Glutensiz Karabuğdaylı Tahinli Çörek',
        description: 'Adet olarak servis edilir.',
        price: '260',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/45479512.jpg??width=400'
      },
      {
        name: 'Karabuğdaylı Kakaolu Cevizli Kurabiye',
        description: '100 gr. olarak servis edilir.',
        price: '260',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66027078.jpg??width=400'
      },
      {
        name: 'Glutensiz Vişneli Brownie (Rafine Şekersiz)',
        description: 'Bitter çikolata, beyaz çikolata sos, öğütülmüş badem, nohut, vişne, tereyağ...',
        price: '220',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66883030.jpg??width=400'
      },
      {
        name: 'Glutensiz Çikolatalı Muffin',
        description: 'Parça çikolatalı glutensiz tahıl karışımları, keçi boynuzu unu (90 gr.) (Çölyaklara uygun değildir)',
        price: '140',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68098322.jpg??width=400'
      },
      {
        name: 'Glutensiz San Sebastian',
        description: 'Dilim olarak servis edilir.',
        price: '280',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67309389.jpg??width=800'
      },
      {
        name: 'Karabuğday Ekmeği (Dilim)',
        description: '70-80 gr. olarak servis edilir.',
        price: '50',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/69442172.jpg??width=400'
      },
      {
        name: 'Frambuazlı Cheesecake',
        description: 'Glutensizdir. Dilim olarak servis edilir.',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/70457796.jpg??width=400'
      },
      {
        name: 'Limonlu Cheesecake',
        description: 'Glutensizdir. Dilim olarak servis edilir.',
        price: '270',
        photo_url: ''
      }
    ]
  },
  {
    name: 'Çorbalar',
    items: [
      {
        name: 'Mercimek Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
      {
        name: 'Ezogelin Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
      {
        name: 'Yayla Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
      {
        name: 'Köz Domates Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
      {
        name: 'Mantar Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
      {
        name: 'Tavuk Suyu Çorbası',
        description: '',
        price: '140',
        photo_url: ''
      },
    ]
  },
  {
    name: 'Granolalar',
    items: [
      {
        name: 'Meyveli Glutensiz Granola',
        description: 'Ev yapımı glutensiz granolanın yanında taze meyve bowl. ',
        price: '350',
        photo_url: 'https://cdn.tgoapps.com/mnresize/384/-/tgo2/spm/prod/meal/media/images/product/154388/10372811_1732911971552.jpg'
      },
      {
        name: 'Granola',
        description: 'Granola, yulaf ezmesi, yoğurt, fındık, badem, Hindistan cevizi, kuru kayısı, kuru üzüm, siyah kuru üzüm',
        price: '260',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/69003777.jpg??width=800'
      }
    ]
  },
  {
    name: 'Kahvaltılıklar',
    items: [
      {
        name: 'Express Kahvaltı',
        description: '',
        price: '500',
        photo_url: ''
      },
      {
        name: 'Sahanda Sucuk',
        description: '',
        price: '250',
        photo_url: ''
      },
      {
        name: 'Sucuklu Menemen',
        description: 'Taze domates ile 45gr. 100% dana eti Kayseri sucuk',
        price: '310',
        photo_url: ''
      },
      {
        name: 'Peynir Tabağı',
        description: 'Ezine peyniri, çeçil peyniri, kaşar peyniri, tulum peyniri, eski kaşar peyniri',
        price: '350',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27794849.jpg??width=400'
      },
      {
        name: 'Söğüş Tabağı',
        description: 'Domates, salatalık, roka, mısır',
        price: '185',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795072.jpg??width=400'
      },
      {
        name: 'Sahanda Yumurta',
        description: '2 adet yumurta',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795536.jpg??width=400'
      },
      {
        name: 'Sahanda Kavurmalı Yumurta',
        description: '2 adet yumurta, 60gr. saf dana kavurma',
        price: '220',
        photo_url: ''
      },
      {
        name: 'Sade Omlet',
        description: 'Organik gezen tavuk yumurtası, nefis tereyağı, Cherry domates, salatalık',
        price: '240',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795577.jpg??width=400'
      },
      {
        name: 'Kavurmalı Omlet',
        description: '2 adet yumurta ve 60gr saf dana kavurma ile omlet',
        price: '300',
        photo_url: ''
      },
      {
        name: 'Peynirli Omlet',
        description: 'Organik gezen tavuk yumurtası, nefis tereyağı, ezine peyniri. Salata ile',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795581.jpg??width=400'
      },
      {
        name: 'Menemen',
        description: 'Çanakkale domatesi, organik gezen tavuk yumurtası, biber, maydanoz',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795595.jpg??width=400'
      },
      {
        name: 'Kaşarlı Menemen',
        description: 'Çanakkale domatesi, organik gezen tavuk yumurtası, taze kaşar peyniri, biber',
        price: '280',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27795601.jpg??width=400'
      },
      {
        name: 'Fit Pancake',
        description: 'Yulaflı fit pancake, akça ağaç şurubu, meyve dilimleri, çikolata sos',
        price: '325',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/28395931.jpg??width=400'
      },
      {
        name: 'Kaşarlı Omlet',
        description: 'Gezen tavuk yumurtası, taze kaşar peyniri, cherry domates',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30233670.jpg??width=400'
      },
      {
        name: 'Wellness Sporcu Omleti',
        description: 'Yumurta beyazı, haşlanmış patates, keçi peyniri, soğan, maydanoz, salata mix',
        price: '280',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30239872.jpg??width=400'
      },
      {
        name: 'Peynirli Dereotlu Anne Poğaçası',
        description: 'Beyaz peynir',
        price: '60',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/41793336.jpg??width=800'
      },
      {
        name: 'Simit',
        description: 'Susamla kaplı yuvarlak bir ekmek çeşididir.',
        price: '40',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/41924171.jpg??width=800'
      },
      {
        name: 'Sahanda Sucuklu Yumurta',
        description: 'Tek kişilik. 45gr sucuk',
        price: '300',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/43634608.jpg??width=800'
      },
      {
        name: 'Yumurtalı Sucuklu Omlet',
        description: '45gr 100% dana eti Kayseri sucuğu, yumurta. Domates, salatalık, mevsim yeşillikleri ile',
        price: '290',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66231015.jpg??width=800'
      },
      {
        name: 'Karamelize Soğanlı Omlet',
        description: 'Yumurta, karamelize soğan',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66825305.jpg??width=800'
      },
      {
        name: 'Organik Yumurtalı Kavurmalı Omlet',
        description: 'Organik yumurta, 80gr dana kavurma. Salatalık, domates ile',
        price: '310',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/69247056.jpg??width=800'
      }
    ]
  },
  {
    name: 'Tostlar',
    items: [
      {
        name: 'Bazlama Ekmeğine Kaşarlı Tost',
        description: 'Nefis bazlama ekmeği, acuka, taze kaşar peyniri. Salata ile',
        price: '240',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/32569915.jpg??width=800'
      },
      {
        name: 'Bazlama Ekmeğine Karışık Tost',
        description: 'Nefis bazlama ekmeği, acuka, taze kaşar peyniri, 45gr dana eti Kayseri sucuğu',
        price: '340',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/32569942.jpg??width=800'
      },
      {
        name: 'Bazlama Ekmeğine Peynirli Tost',
        description: 'Bazlama ekmeği, Ezine peynir. Acuka, salata ile',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/32581588.jpg??width=800'
      },
      {
        name: 'Kaşarlı Tost',
        description: 'Kaşar peyniri',
        price: '220',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/43732714.jpg??width=800'
      },
      {
        name: 'Karışık Tost',
        description: '45gr 100% dana Kayseri sucuk, kaşar peyniri',
        price: '290',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/43734250.jpg??width=800'
      },
      {
        name: 'Kavurmalı Kaşarlı Bazlama Tost',
        description: 'Bazlama ekmeğine; acuka, 80gr dana kavurma, kaşar peyniri. Salata ile',
        price: '350',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/69255102.jpg??width=800'
      }
    ]
  },
  {
    name: 'Sandviçler',
    items: [
      {
        name: 'Ton Balıklı Sandviç',
        description: 'Nefis sandviç ekmeğine; dereotu, domates, Mevsim yeşilliği, 160gr ton balığı',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27796552.jpg??width=800'
      },
      {
        name: 'Izgara Tavuklu Sandviç',
        description: 'Nefis sandviç ekmeğine 200gr ızgara tavuk but',
        price: '330',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27796905.jpg??width=800'
      },
      {
        name: 'Somon Füme Sandviç',
        description: 'Nefis sandviç ekmeğine; 80gr füme somon, roka, turşu, kırmızı soğan',
        price: '390',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30220502.jpg??width=800'
      },
      {
        name: 'Klasik Peynirli Sandviç',
        description: 'Nefis sandviç ekmeğine; Ezine beyaz peynir, yeşillik, domates, salatalık',
        price: '190',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/32786376.jpg??width=800'
      },
      {
        name: 'Klasik Kaşarlı Sandviç',
        description: 'Nefis sandviç ekmeğine; Ezine beyaz peynir, yeşillik, domates, salatalık',
        price: '190',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/32786380.jpg??width=800'
      }
    ]
  },
  {
    name: 'Salatalar',
    items: [
      {
        name: 'Sezar Salata',
        description: '200gr ızgara tavuk parçaları, göbek marul, kruton, parmesan',
        price: '410',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27797227.jpg??width=400'
      },
      {
        name: 'Ton Balıklı Salata',
        description: '160gr ton balığı, marul, domates, salatalık, zeytinyağı',
        price: '420',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30227790.jpg??width=400'
      },
      {
        name: 'Kinoa Salatası',
        description: 'Domates, salatalık, biber, zeytin, peynir',
        price: '350',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66231017.jpg??width=400'
      },
      {
        name: 'Çıtır Tavuk Salatası',
        description: 'Mevsim yeşillikleri, domates, salatalık',
        price: '410',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66231020.jpg??width=400'
      }
    ]
  },
  {
    name: 'Bowllar',
    items: [
      {
        name: 'Sporcu Bowl',
        description: 'Jasmin pirinç, 200gr jülyen kesim tavuk, avakado, sebze mix',
        price: '490',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/39849728.jpg??width=800'
      },
      {
        name: 'Bomb Bowl',
        description: 'Jasmin pirinç, bomb soslu tavuk, sebze mix, hellim peyniri',
        price: '470',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/39849961.jpg??width=800'
      },
      {
        name: 'Noodle & General Tso Chicken',
        description: 'Sebzeli noodle, özel soslu çıtır tavuk',
        price: '430',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/43389924.jpg??width=800'
      },
      {
        name: 'Burger Bowl',
        description: '170 gr. burger köfte, cheddar peyniri, yeşillik, fırınlanmış patates, turşu dilimleri',
        price: '550',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/54211184.jpg??width=800'
      },
      {
        name: 'Teriyaki Somon Bowl',
        description: 'Krema, teriyaki sos, 170gr somon, siyah pirinç pilavı, sote karnabahar ve brokoli.',
        price: '590',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/63957582.jpg??width=800'
      },
      {
        name: 'Kahvaltı Bowl',
        description: 'Avokado dilimleri, akdeniz yeşilliği, 2 adet haşlanmış yumurta, beyaz peynir',
        price: '460',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/63957583.jpg??width=800'
      },
      {
        name: 'Burrito Bowl',
        description: 'Siyah pirinç pilavı, 200gr kızarmış tavuk dilimleri, mısır, Meksika fasulyesi, avokado',
        price: '495',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/64598567.jpg??width=800'
      },
      {
        name: 'Mücver Bowl',
        description: 'Mücver, süzme yoğurt, dereotu, çörek otu',
        price: '410',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66231019.jpg??width=800'
      },
      {
        name: 'Fit Bowl',
        description: 'Pembe sultan, brokoli, domates, pancar turşusu, portakal, salatalık, kinoa',
        price: '470',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67922060.jpg??width=800'
      },
      {
        name: 'Tahıllı Bowl',
        description: 'Tahıllı bowl, yeşillik, tahin sos, greçka, firik bulguru, kinoa, avokado, nar, nohut',
        price: '440',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68935072.jpg??width=800'
      }
    ]
  },
  {
    name: 'Burgerler',
    items: [
      {
        name: 'Cheeseburger',
        description: '170 gr. burger köftesi, marul, turşu, domates, karamelize soğan. Patates kızartması ile',
        price: '510',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30233667.jpg??width=800'
      },
      {
        name: 'Klasik Burger',
        description: '170 gr. dana eti burger köftesi, marul, cheddar peyniri, turşu, domates, karamelize soğan',
        price: '495',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30233687.jpg??width=800'
      },
      {
        name: 'Tavuk Burger',
        description: '100gr Izgara tavuk, cheddar peyniri, karamelize soğan, domates, salatalık turşusu, marul',
        price: '395',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67510753.jpg??width=800'
      }
    ]
  },
  {
    name: 'Pizzalar',
    items: [
      {
        name: 'Margherita Pizza',
        description: '',
        price: '390',
        photo_url: ''
      },
      {
        name: 'Sucuk Sever Pizza',
        description: '',
        price: '440',
        photo_url: ''
      },
      {
        name: 'Anadolu Ateşi Pizza',
        description: '',
        price: '470',
        photo_url: ''
      },
    ]
  },
  {
    name: 'Wrapler',
    items: [
      {
        name: 'Tavuklu Wrap',
        description: 'Tam buğday tortilla, renkli biber, mısır, cheddar peyniri, 200gr tavuk',
        price: '420',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27797470.jpg??width=800'
      },
      {
        name: 'Sebzeli Wrap',
        description: 'Meksika fasulye, renkli biber, mısır, mantar, cheddar peyniri',
        price: '370',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27797544.jpg??width=800'
      }
    ]
  },
  {
    name: 'Makarnalar',
    items: [
      {
        name: 'Köfteli Spaghetti',
        description: '',
        price: '450',
        photo_url: 'https://cdn.tgoapps.com/mnresize/384/-/tgo2/spm/prod/meal/media/images/product/154388/4659778_1727280953417.jpg'
      },
      {
        name: 'Penne Arrabbiata',
        description: 'Penne, Napolitan sos, parmesan, dilimli zeytin, taze fesleğen',
        price: '360',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30232223.jpg??width=800'
      },
      {
        name: 'Fettuccine Alfredo',
        description: '150gr tavuk parçaları, krema, mantar, taze fesleğen',
        price: '410',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30232311.jpg??width=800'
      },
      {
        name: 'Fettuccine Sebzeli',
        description: 'Fettuccine, renkli biberler, parmesan peyniri, mantar',
        price: '360',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/30233635.jpg??width=800'
      }
    ]
  },
  {
    name: 'Tatlılar',
    items: [
      {
        name: 'Pekmezli Kurabiye',
        description: '',
        price: '50',
        photo_url: ''
      },
      {
        name: 'Karamelize Soğanlı Kurabiye',
        description: '',
        price: '40',
        photo_url: ''
      },
      {
        name: 'Fındıklı Kurabiye',
        description: '',
        price: '30',
        photo_url: ''
      },
      {
        name: 'Kakaolu Kurabiye',
        description: '',
        price: '30',
        photo_url: ''
      },
      {
        name: 'San Sebastian',
        description: 'Çikolata sos ile servis edilir',
        price: '250',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67309389.jpg??width=800'
      },
      {
        name: 'Limonlu Cheesecake',
        description: 'Dilim olarak servis edilir.',
        price: '270',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66379998.jpg??width=800'
      },
      {
        name: 'Frambuazlı Cheesecake',
        description: 'Dilim olarak servis edilir.',
        price: '270',
        photo_url: ''
      }
    ]
  },
  {
    name: 'Vitamin Bar',
    items: [
      {
        name: 'Sarı Detox',
        description: 'Limon, portakal, dereotu, salatalık. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801136.jpg??width=800'
      },
      {
        name: 'Turuncu Detox',
        description: 'Portakal suyu, havuç suyu, taze zencefil, limon. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801157.jpg??width=800'
      },
      {
        name: 'Yeşil Detox',
        description: 'Elma, salatalık, maydanoz, taze zencefil. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801448.jpg??width=800'
      },
      {
        name: 'Taze Sıkma Portakal Suyu',
        description: 'Soğuk servis edilir.',
        price: '190',
        photo_url: 'https://cdn.tgoapps.com/mnresize/384/-/tgo2/spm/prod/meal/media/images/product/154388/4007838_1725719519824.jpg'
      },
      {
        name: 'Taze Sıkma Havuç Suyu',
        description: 'Soğuk servis edilir.',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801473.jpg??width=800'
      },
      {
        name: 'Taze Sıkma Elma Suyu',
        description: 'Soğuk servis edilir.',
        price: '145',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801750.jpg??width=800'
      },
      {
        name: 'Limonata (Ev Yapımı)',
        description: 'Limon, su, şeker. 330ml',
        price: '175',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/43387570.jpg??width=800'
      },
      {
        name: 'Naneli Limonata (Ev Yapımı)',
        description: 'Soğuk servis edilir. 330ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963850.jpg??width=800'
      },
      {
        name: 'Çilekli Limonata (Ev Yapımı)',
        description: 'Çilek püresi, limonata. 330ml',
        price: '200',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963883.jpg??width=800'
      },
      {
        name: 'Elmalı Limonata',
        description: 'Soğuk servis edilir. 330ml',
        price: '200',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66966582.jpg??width=800'
      }
    ]
  },
  {
    name: 'Sıcak İçecekler',
    items: [
      {
        name: 'Salep',
        description: 'Tarçın ile',
        price: '165',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68806376.jpg??width=800'
      },
      {
        name: 'Chai Tea Latte',
        description: 'Tarçın ile',
        price: '165',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68806389.jpg??width=800'
      },
      {
        name: 'Sıcak Çikolata',
        description: 'Sıcak servis edilir.',
        price: '190',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68806513.jpg??width=800'
      }
    ]
  },
  {
    name: 'Sıcak Kahveler',
    items: [
      {
        name: 'Espresso',
        description: '',
        price: '150',
        photo_url: ''
      },
      {
        name: 'Espresso Double',
        description: '',
        price: '170',
        photo_url: ''
      },
      {
        name: 'Syphon Demleme Kahve',
        description: '',
        price: '340',
        photo_url: ''
      },
      {
        name: 'Türk Kahvesi',
        description: '',
        price: '145',
        photo_url: ''
      },
      {
        name: 'Double Türk Kahvesi',
        description: '',
        price: '200',
        photo_url: ''
      },
      {
        name: 'Cafe Miel',
        description: '',
        price: '200',
        photo_url: ''
      },
      {
        name: 'Filtre Kahve',
        description: '',
        price: '175',
        photo_url: ''
      },
      {
        name: 'Filtre Kahve V60',
        description: '',
        price: '390',
        photo_url: 'https://cdn.tgoapps.com/mnresize/384/-/tgo2/spm/prod/meal/media/images/product/154388/8615316_1723984555683.jpg'
      },
      {
        name: 'Americano',
        description: 'Sıcak servis edilir.',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798043.jpg??width=800'
      },
      {
        name: 'Latte Macchiato',
        description: 'Sıcak servis edilir.',
        price: '195',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798048.jpg??width=800'
      },
      {
        name: 'Latte',
        description: 'Sıcak servis edilir.',
        price: '195',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798057.jpg??width=800'
      },
      {
        name: 'Flat White',
        description: 'Sıcak servis edilir.',
        price: '195',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798071.jpg??width=800'
      },
      {
        name: 'Cortado',
        description: 'Sıcak servis edilir.',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798082.jpg??width=800'
      },
      {
        name: 'Mocha',
        description: 'Sıcak servis edilir.',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798100.jpg??width=800'
      },
      {
        name: 'Chemex',
        description: 'Sıcak servis edilir.',
        price: '390',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798125.jpg??width=800'
      },
      {
        name: 'Affogato',
        description: 'Sıcak servis edilir.',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798139.jpg??width=800'
      },
      {
        name: 'Cappuccino',
        description: 'Sıcak servis edilir.',
        price: '195',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798143.jpg??width=800'
      },
      {
        name: 'Zerdeçallı Latte',
        description: 'Zerdeçal, tarçın, esmer şeker, kakule, zencefil, muskat, kakao, süt',
        price: '230',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68934926.jpg??width=800'
      }
    ]
  },
  {
    name: 'Soğuk Kahveler',
    items: [
      {
        name: 'Frappe',
        description: '350ml',
        price: '185',
        photo_url: ''
      },
      {
        name: 'Ice Filtre Kahve',
        description: '350ml',
        price: '190',
        photo_url: 'https://cdn.tgoapps.com/mnresize/384/-/tgo2/spm/prod/meal/media/images/product/154388/4010259_1723647028182.jpg'
      },
      {
        name: 'Iced Americano',
        description: 'Soğuk servis edilir. 350ml',
        price: '195',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798450.jpg??width=800'
      },
      {
        name: 'Iced Latte',
        description: 'Soğuk servis edilir. 350ml',
        price: '215',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798474.jpg??width=800'
      },
      {
        name: 'Iced Mocha',
        description: 'Soğuk servis edilir. 350ml',
        price: '230',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798488.jpg??width=800'
      },
      {
        name: 'Iced Cookie Latte',
        description: 'Soğuk servis edilir. 350ml',
        price: '250',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798499.jpg??width=800'
      }
    ]
  },
  {
    name: 'Medipoint Smoothieler',
    items: [
      {
        name: 'Avokado Smoothie',
        description: 'Avokado, mango, süt, yoğurt. 350ml',
        price: '230',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27801755.jpg??width=800'
      },
      {
        name: 'Atom Smoothie',
        description: 'Muz, bal, ceviz, süt, yoğurt. 350ml',
        price: '240',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27802079.jpg??width=800'
      },
      {
        name: 'Çilekli Smoothie',
        description: 'Çilek püresi, süt, yoğurt. 350ml',
        price: '230',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67328110.jpg??width=800'
      },
      {
        name: 'Muzlu Smoothie',
        description: 'Muz, bal, süt yoğurt. 350ml',
        price: '230',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67333813.jpg??width=800'
      }
    ]
  },
  {
    name: 'Frozenlar',
    items: [
      {
        name: 'Çilekli Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27800017.jpg??width=800'
      },
      {
        name: 'Mango Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66881307.jpg??width=800'
      },
      {
        name: 'Muzlu Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66883998.jpg??width=800'
      },
      {
        name: 'Karpuzlu Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963749.jpg??width=800'
      },
      {
        name: 'Elmalı Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963790.jpg??width=800'
      },
      {
        name: 'Kivili Frozen',
        description: 'Soğuk servis edilir. 350ml',
        price: '180',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963812.jpg??width=800'
      }
    ]
  },
  {
    name: 'Milkshakeler',
    items: [
      {
        name: 'Çilekli Milkshake',
        description: 'Soğuk servis edilir. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27800824.jpg??width=800'
      },
      {
        name: 'Çikolatalı Milkshake',
        description: 'Soğuk servis edilir. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/48438160.jpg??width=800'
      },
      {
        name: 'Muzlu Milkshake',
        description: 'Soğuk servis edilir. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/66963908.jpg??width=800'
      },
      {
        name: 'Karamelli Milkshake',
        description: 'Soğuk servis edilir. 350ml',
        price: '210',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/67309413.jpg??width=800'
      }
    ]
  },
  {
    name: 'Wellness Bitki Çayları',
    items: [
      {
        name: 'Melisa Çayı',
        description: '330ml',
        price: '150',
        photo_url: ''
      },
      {
        name: 'Çay',
        description: '130ml',
        price: '40',
        photo_url: 'https://img.odatv.com/rcman/Cw1280h720q95gc/storage/files/images/2024/11/10/bir-bardak-cay-250-lira-oldu-09bn.png'
      },
      {
        name: 'Fincan Çay',
        description: '330ml',
        price: '60',
        photo_url: 'https://lh6.googleusercontent.com/proxy/QPujk4KomY462NwBFBRTPNfGqpKrNrMhJLoT-RDHKXbMpwQ1qQoBsnQYNPpKqMsO6fdZ7DlizcQtfX77yHYLIZMGq1f2_3J3id0zAqVz57CzYUVTVhaoAfvxlX2AZw'
      },
      {
        name: 'Blue Butterfly',
        description: 'İsteğe göre esmer şeker veya bal, limon. 330ml',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68619681.jpg??width=800'
      },
      {
        name: 'Ada Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628865.jpg??width=800'
      },
      {
        name: 'Detox Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '170',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628879.jpg??width=800'
      },
      {
        name: 'Ihlamur',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628884.jpg??width=800'
      },
      {
        name: 'Kış Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628888.jpg??width=800'
      },
      {
        name: 'Kuşburnu Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628902.jpg??width=800'
      },
      {
        name: 'Nane Limon Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628905.jpg??width=800'
      },
      {
        name: 'Papatya Çayı',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628908.jpg??width=800'
      },
      {
        name: 'Yeşil Çay',
        description: 'Sıcak servis edilir. 330ml',
        price: '150',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68628919.jpg??width=800'
      },
      {
        name: 'Avokadolu Karışık Çay',
        description: 'Avokado, kiraz şapı, mısır püskülü, papatya, funda, ardıç. 330ml',
        price: '160',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68630475.jpg??width=800'
      }
    ]
  },
  {
    name: 'İçecekler',
    items: [
      {
        name: 'Fanta',
        description: 'Kutu içecek. 330ml',
        price: '90',
        photo_url: 'https://images.migrosone.com/sanalmarket/product/08011004/8011004_yan-7d2460-1650x1650.png'
      },
      {
        name: 'Sprite',
        description: 'Kutu içecek. 330ml',
        price: '90',
        photo_url: 'https://images.migrosone.com/sanalmarket/product/08030000/08030000_1-881eaf-1650x1650.png'
      },
      {
        name: 'Ayran',
        description: '',
        price: '80',
        photo_url: 'https://images.migrosone.com/macrocenter/product/46054715/46054715-8a2faf-8a2faf-1650x1650.jpg'
      },
      {
        name: 'Coca-Cola Zero Sugar',
        description: 'Kutu içecek. 330ml',
        price: '90',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27798584.jpg??width=800'
      },
      {
        name: 'Coca-Cola',
        description: 'Kutu içecek',
        price: '90',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/27799234.jpg??width=800'
      },
      {
        name: 'Churchill',
        description: 'Soda, limon, tuz.',
        price: '80',
        photo_url: ''
      },
      {
        name: 'Soda',
        description: 'Cam şişe. 200ml',
        price: '60',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/40312521.jpg??width=800'
      },
      {
        name: 'Fuse Tea Limon',
        description: 'Kutu içecek. 330ml',
        price: '90',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68144225.jpg??width=800'
      },
      {
        name: 'Fuse Tea Şeftali',
        description: 'Kutu içecek. 330ml',
        price: '90',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68144232.jpg??width=800'
      },
      {
        name: 'Su',
        description: 'Cam şişe. 330ml',
        price: '50',
        photo_url: 'https://images.deliveryhero.io/image/fd-tr/Products/68144240.jpg??width=800'
      }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const menuCategories = document.querySelector('.menu-categories');
  const navbar = document.querySelector('.navbar');

  // Add navigation links
  navbar.innerHTML = menuData.map(category =>
    `<a href="#${category.name.replace(/\s+/g, '-')}">${category.name}</a>`
  ).join('');

  // Render menu categories and items
  menuCategories.innerHTML = menuData.map(category => `
    <section class="category" id="${category.name.replace(/\s+/g, '-')}">
      <h2>${category.name}</h2>
      <div class="menu-items">
        ${category.items.map(item => `
          <div class="menu-item" onclick="showItemModal('${item.photo_url}', '${item.name}', '${item.description}', '${item.price}')">
            <img src="${item.photo_url}" alt="${item.name}">
            <div class="item-details">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <span class="price">₺${item.price}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `).join('');

  // Add item modal to the page
  const itemViewModal = document.createElement('div');
  itemViewModal.id = 'itemViewModal';
  itemViewModal.className = 'item-view-modal';
  itemViewModal.innerHTML = `
    <div class="item-view-content">
      <span class="close-item-view">&times;</span>
      <img id="modalImage" src="" alt="">
      <h2 id="modalTitle"></h2>
      <p id="modalDescription"></p>
      <span id="modalPrice" class="price"></span>
    </div>
  `;
  document.body.appendChild(itemViewModal);

  // Close modal when clicking the close button or outside the modal
  const closeItemView = document.querySelector('.close-item-view');
  if (closeItemView) {
    closeItemView.onclick = () => {
      itemViewModal.style.display = 'none';
    };
  }

  window.onclick = (e) => {
    if (e.target === itemViewModal) {
      itemViewModal.style.display = 'none';
    }
    if (e.target === itemModal) {
      itemModal.style.display = 'none';
    }
    if (e.target === categoryModal) {
      categoryModal.style.display = 'none';
    }
  };

  // Add event listeners for Add buttons if they exist
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      itemModal.style.display = 'flex';
    });
  }

  if (closeItemModal) {
    closeItemModal.addEventListener('click', () => {
      itemModal.style.display = 'none';
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      categoryModal.style.display = 'flex';
    });
  }

  if (closeCategoryModal) {
    closeCategoryModal.addEventListener('click', () => {
      categoryModal.style.display = 'none';
    });
  }

  if (addItemForm) {
    addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      itemModal.style.display = 'none';
      addItemForm.reset();
    });
  }

  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      categoryModal.style.display = 'none';
      addCategoryForm.reset();
    });
  }
});

function toggleDescription(element) {
  const expanded = element.classList.contains('expanded');
  const allItems = document.querySelectorAll('.menu-item');
  allItems.forEach(item => item.classList.remove('expanded'));
  if (!expanded) {
    element.classList.add('expanded');
  }
}

function showItemModal(photoUrl, name, description, price) {
  const modal = document.getElementById('itemViewModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDescription');
  const modalPrice = document.getElementById('modalPrice');

  if (modal && modalImg && modalTitle && modalDesc && modalPrice) {
    modalImg.src = photoUrl;
    modalTitle.textContent = name;
    modalDesc.textContent = description;
    modalPrice.textContent = `₺${price}`;
    modal.style.display = 'flex';
  }
}