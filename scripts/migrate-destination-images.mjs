import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB?retryWrites=true&w=majority';

const CORRECT_DESTINATION_DATA = {
  'taj-mahal': {
    name: 'Taj Mahal',
    slug: 'taj-mahal',
    image: '/images/destinations/taj-mahal/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/taj-mahal/primary.jpg',
      storageKey: 'destinations/taj-mahal/primary.jpg',
      filename: 'taj-mahal-primary.jpg',
      caption: 'Ivory-white marble mausoleum with reflecting pool along Charbagh axis',
      alt: 'Taj Mahal ivory-white marble mausoleum with reflecting pool, Agra',
      source: 'Verified Architectural Archive',
      size: 169113,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/taj-mahal/gallery-1.jpg',
        storageKey: 'destinations/taj-mahal/gallery-1.jpg',
        caption: 'Central marble dome and reflecting pool along the Charbagh axis at dusk',
        alt: 'Taj Mahal central dome and reflection pool at sunset',
        order: 0,
        filename: 'taj-mahal-reflection-sunset.jpg',
        size: 220874,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/taj-mahal/gallery-2.jpg',
        storageKey: 'destinations/taj-mahal/gallery-2.jpg',
        caption: 'Taj Mahal marble plinth and chattris across the Yamuna River',
        alt: 'Taj Mahal plinth and riverfront terrace at golden hour',
        order: 1,
        filename: 'taj-mahal-yamuna-terrace.jpg',
        size: 108464,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/taj-mahal/gallery-3.jpg',
        storageKey: 'destinations/taj-mahal/gallery-3.jpg',
        caption: 'Charbagh garden pathways leading to the central marble platform',
        alt: 'Charbagh garden landscape leading to Taj Mahal plinth',
        order: 2,
        filename: 'taj-mahal-charbagh-path.jpg',
        size: 140884,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
  },
  'red-fort': {
    name: 'Red Fort',
    slug: 'red-fort',
    image: '/images/destinations/red-fort/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/red-fort/primary.jpg',
      storageKey: 'destinations/red-fort/primary.jpg',
      filename: 'red-fort-lahori-gate-primary.jpg',
      caption: 'Lahori Gate and massive red sandstone ramparts with the Indian national flag',
      alt: 'Red Fort Lahori Gate and red sandstone ramparts, Old Delhi',
      source: 'Verified Architectural Archive',
      size: 301667,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/red-fort/gallery-1.jpg',
        storageKey: 'destinations/red-fort/gallery-1.jpg',
        caption: 'Diwan-i-Aam red sandstone arcade and imperial audience hall',
        alt: 'Diwan-i-Aam pillared arcade at Red Fort Delhi',
        order: 0,
        filename: 'red-fort-diwan-i-aam.jpg',
        size: 329059,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/red-fort/gallery-2.jpg',
        storageKey: 'destinations/red-fort/gallery-2.jpg',
        caption: 'Lahori Gate ceremonial portal with chattris and Indian national flag',
        alt: 'Lahori Gate ceremonial entrance to Red Fort Delhi',
        order: 1,
        filename: 'red-fort-lahori-gate-detail.jpg',
        size: 353699,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
  },
  'qutub-minar': {
    name: 'Qutub Minar',
    slug: 'qutub-minar',
    image: '/images/destinations/qutub-minar/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/qutub-minar/primary.jpg',
      storageKey: 'destinations/qutub-minar/primary.jpg',
      filename: 'qutub-minar-fluted-tower.jpg',
      caption: 'Soaring 72.5-meter fluted red sandstone minaret and Alai Darwaza under blue sky',
      alt: 'Qutub Minar fluted sandstone victory tower and Alai Darwaza, Delhi',
      source: 'Verified Architectural Archive',
      size: 424752,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/qutub-minar/gallery-1.jpg',
        storageKey: 'destinations/qutub-minar/gallery-1.jpg',
        caption: 'Alai Darwaza gateway arch with intricate red sandstone and marble carvings',
        alt: 'Intricate red sandstone and marble carvings of Alai Darwaza gateway',
        order: 0,
        filename: 'qutub-alai-darwaza-facade.jpg',
        size: 568468,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/qutub-minar/gallery-2.jpg',
        storageKey: 'destinations/qutub-minar/gallery-2.jpg',
        caption: 'Qutub Minar tower framed by historic Quwwat-ul-Islam stone arcades',
        alt: 'Qutub Minar framed through stone arches of the Quwwat-ul-Islam complex',
        order: 1,
        filename: 'qutub-minar-framed-arch.jpg',
        size: 528165,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
  },
  'hampi': {
    name: 'Hampi Monuments',
    slug: 'hampi',
    image: '/images/destinations/hampi/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/hampi/primary.jpg',
      storageKey: 'destinations/hampi/primary.jpg',
      filename: 'hampi-stone-chariot-sunset.jpg',
      caption: 'Iconic monolithic Stone Chariot at Vijaya Vittala Temple at sunset',
      alt: 'Stone Chariot at Vijaya Vittala Temple at sunset, Hampi',
      source: 'Verified Architectural Archive',
      size: 749549,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/hampi/gallery-1.jpg',
        storageKey: 'destinations/hampi/gallery-1.jpg',
        caption: 'Virupaksha Temple monumental eastern gopuram and surrounding ruins',
        alt: 'Virupaksha Temple gopuram tower rising above Hampi boulder hills',
        order: 0,
        filename: 'hampi-virupaksha-temple-gopuram.jpg',
        size: 265978,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/hampi/gallery-2.jpg',
        storageKey: 'destinations/hampi/gallery-2.jpg',
        caption: 'Sculpted granite pillars inside the Vijaya Vittala Temple pavilion',
        alt: 'Intricately carved granite pillars of Vijaya Vittala Temple hall',
        order: 1,
        filename: 'hampi-vittala-pillared-hall.jpg',
        size: 468467,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
  },
  'ajanta-caves': {
    name: 'Ajanta Caves',
    slug: 'ajanta-caves',
    image: '/images/destinations/ajanta-caves/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/ajanta-caves/primary.jpg',
      storageKey: 'destinations/ajanta-caves/primary.jpg',
      filename: 'ajanta-caves-horseshoe-gorge.jpg',
      caption: 'Panoramic view of the crescent horseshoe volcanic gorge along the Waghur River',
      alt: 'Panoramic view of Ajanta rock-cut Buddhist caves along the horseshoe Waghur River gorge',
      source: 'Verified Architectural Archive',
      size: 399146,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/ajanta-caves/gallery-1.jpg',
        storageKey: 'destinations/ajanta-caves/gallery-1.jpg',
        caption: 'Cave 19 Chaitya prayer hall facade with rock-cut stupa and horseshoe window',
        alt: 'Rock-cut facade and chandrashala window of Cave 19 at Ajanta',
        order: 0,
        filename: 'ajanta-cave-19-facade.jpg',
        size: 452986,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/ajanta-caves/gallery-2.jpg',
        storageKey: 'destinations/ajanta-caves/gallery-2.jpg',
        caption: 'World-renowned 5th-century Padmapani Bodhisattva mural painting in Cave 1',
        alt: 'Ancient Padmapani Bodhisattva tempera fresco in Cave 1 at Ajanta',
        order: 1,
        filename: 'ajanta-cave-1-padmapani.jpg',
        size: 970966,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/ajanta-caves/gallery-3.jpg',
        storageKey: 'destinations/ajanta-caves/gallery-3.jpg',
        caption: 'Monolithic rock-cut stupa with seated Buddha inside Cave 26 Chaitya hall',
        alt: 'Cave 26 Chaitya interior with rock-cut stupa and Buddha sanctuary',
        order: 2,
        filename: 'ajanta-cave-26-chaitya-stupa.jpg',
        size: 402553,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
  },
  'sun-temple-konark': {
    name: 'Sun Temple Konark',
    slug: 'sun-temple-konark',
    tagline: 'The Grand Cosmic Chariot of Surya',
    description: 'Conceived as a colossal chariot for the Sun God Surya, featuring 24 exquisitely carved stone wheels that function as accurate astronomical sundials, pulled by seven caparisoned stone horses.',
    historicalBackground: 'Commissioned around 1250 CE by King Narasimhadeva I of the Eastern Ganga Dynasty to commemorate military victories and celebrate the Sun God Surya. Built near the Bay of Bengal coastline, European sailors referred to the grand tower as the "Black Pagoda" because it served as an essential maritime navigational landmark along the coast.',
    state: 'Odisha',
    city: 'Puri',
    address: 'Sun Temple, Konark, Puri District, Odisha, India',
    latitude: 19.8876,
    longitude: 86.0945,
    category: 'Kalinga Sacred Architecture',
    openingHours: { open: '06:00', close: '20:00' },
    weeklyClosingDay: 'None',
    entryFee: {
      indianAdult: 40,
      saarcBimstec: 40,
      foreignerAdult: 600,
      child: 0,
      mausoleumSupplement: 0,
    },
    visitorInstructions: [
      'Sanctum interior has been sealed with sand for structural conservation since 1903.',
      'Do not touch or lean against intricately carved Chlorite stone reliefs.',
      'Guides must possess official Archaeological Survey of India (ASI) badges.',
    ],
    websiteUrl: 'https://asi.nic.in',
    isFeatured: true,
    isActive: true,
    image: '/images/destinations/sun-temple-konark/primary.jpg',
    primaryImageMetadata: {
      url: '/images/destinations/sun-temple-konark/primary.jpg',
      storageKey: 'destinations/sun-temple-konark/primary.jpg',
      filename: 'konark-sun-temple-sanctuary.jpg',
      caption: 'Colossal 13th-century Jagamohana sanctuary tower and carved stone chariot platform',
      alt: 'Konark Sun Temple Jagamohana sanctuary and stone chariot platform, Odisha',
      source: 'Verified Architectural Archive',
      size: 270428,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(),
    },
    gallery: [
      {
        url: '/images/destinations/sun-temple-konark/gallery-1.jpg',
        storageKey: 'destinations/sun-temple-konark/gallery-1.jpg',
        caption: 'Colossal 13th-century stone chariot wheel sundial with astronomical timekeeping spokes',
        alt: 'Intricately sculpted stone chariot wheel sundial at Konark Sun Temple',
        order: 0,
        filename: 'konark-stone-wheel-sundial.jpg',
        size: 548950,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
      {
        url: '/images/destinations/sun-temple-konark/gallery-2.jpg',
        storageKey: 'destinations/sun-temple-konark/gallery-2.jpg',
        caption: 'Natya Mandapa dancing hall pillars leading toward the central Jagamohana portal',
        alt: 'Carved stone pillars of Natya Mandapa at Konark Sun Temple',
        order: 1,
        filename: 'konark-natya-mandapa-pillars.jpg',
        size: 321688,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      },
    ],
    demonstrationCapacity: {
      maxPerHour: 1000,
      standardSlotCapacity: 200,
    },
  },
};

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const collection = db.collection('heritagesites');

  console.log('Starting destination image migration...\n');

  for (const [slug, data] of Object.entries(CORRECT_DESTINATION_DATA)) {
    const existing = await collection.findOne({ slug });
    const allImages = [data.image, ...data.gallery.map(g => g.url)].filter(Boolean);

    if (existing) {
      console.log(`Updating existing destination [${slug}]: ${existing.name}`);
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            image: data.image,
            primaryImageMetadata: data.primaryImageMetadata,
            gallery: data.gallery,
            images: allImages,
            updatedAt: new Date(),
          },
          $push: {
            imageAuditLog: {
              action: 'IMAGE_REPLACED',
              performedBy: null,
              adminEmail: 'system@anvaya.heritage',
              adminName: 'ANVAYA Heritage Preservation System',
              details: {
                reason: 'Corrected mismatched and unrelated photographs with authentic monument photography',
                previousImage: existing.image,
                newImage: data.image,
                galleryCount: data.gallery.length,
              },
              timestamp: new Date(),
            }
          }
        }
      );
      console.log(`  ✅ Successfully updated ${slug}`);
    } else {
      console.log(`Inserting new destination [${slug}]: ${data.name}`);
      const newDoc = {
        ...data,
        images: allImages,
        imageAuditLog: [
          {
            action: 'IMAGE_UPLOADED',
            performedBy: null,
            adminEmail: 'system@anvaya.heritage',
            adminName: 'ANVAYA Heritage Preservation System',
            details: {
              reason: 'Initial enrollment of authentic destination photography',
              image: data.image,
              galleryCount: data.gallery.length,
            },
            timestamp: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await collection.insertOne(newDoc);
      console.log(`  ✅ Successfully inserted ${slug}`);
    }
  }

  console.log('\nMigration complete! Inspecting resulting records...\n');
  const allSites = await collection.find({}).toArray();
  for (const s of allSites) {
    console.log(`- ${s.name} (${s.slug}):`);
    console.log(`    Primary: ${s.image}`);
    console.log(`    Gallery: ${s.gallery?.map(g => g.url).join(', ')}`);
  }

  await client.close();
}

migrate().catch(console.error);
