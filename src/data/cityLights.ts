// Major cities/urban areas [longitude, latitude, intensity 0-1]
export const cityLights: [number, number, number][] = [
  // North America
  [-74, 40.7, 1],    // New York
  [-87.6, 41.9, 0.9], // Chicago
  [-118.2, 34.1, 1],  // Los Angeles
  [-122.4, 37.8, 0.7], // San Francisco
  [-95.4, 29.8, 0.7], // Houston
  [-75.2, 40, 0.6],   // Philadelphia
  [-77, 38.9, 0.7],   // Washington DC
  [-71.1, 42.4, 0.6], // Boston
  [-83, 42.3, 0.6],   // Detroit
  [-80.2, 25.8, 0.6], // Miami
  [-96.8, 32.8, 0.6], // Dallas
  [-104.9, 39.7, 0.5], // Denver
  [-112, 33.4, 0.5],  // Phoenix
  [-122.3, 47.6, 0.5], // Seattle
  [-93.3, 45, 0.4],   // Minneapolis
  [-90.1, 29.9, 0.4], // New Orleans
  [-79.4, 43.7, 0.7], // Toronto
  [-73.6, 45.5, 0.5], // Montreal
  [-123.1, 49.3, 0.4], // Vancouver
  [-99.1, 19.4, 0.9], // Mexico City
  [-103.3, 20.7, 0.5], // Guadalajara

  // South America
  [-43.2, -22.9, 0.9], // Rio
  [-46.6, -23.5, 1],   // São Paulo
  [-58.4, -34.6, 0.8], // Buenos Aires
  [-70.7, -33.4, 0.7], // Santiago
  [-74.1, 4.7, 0.6],   // Bogotá
  [-77, -12, 0.6],     // Lima
  [-66.9, 10.5, 0.5],  // Caracas

  // Europe
  [-0.1, 51.5, 1],    // London
  [2.3, 48.9, 1],     // Paris
  [13.4, 52.5, 0.8],  // Berlin
  [-3.7, 40.4, 0.8],  // Madrid
  [12.5, 41.9, 0.7],  // Rome
  [23.7, 37.9, 0.6],  // Athens
  [14.4, 50.1, 0.5],  // Prague
  [21, 52.2, 0.6],    // Warsaw
  [18.1, 59.3, 0.5],  // Stockholm
  [24.9, 60.2, 0.4],  // Helsinki
  [10.8, 59.9, 0.4],  // Oslo
  [4.9, 52.4, 0.6],   // Amsterdam
  [4.4, 50.8, 0.5],   // Brussels
  [16.4, 48.2, 0.5],  // Vienna
  [8.5, 47.4, 0.5],   // Zurich
  [9.2, 45.5, 0.6],   // Milan
  [-9.1, 38.7, 0.5],  // Lisbon
  [2.2, 41.4, 0.7],   // Barcelona
  [30.5, 50.4, 0.6],  // Kyiv
  [37.6, 55.8, 0.9],  // Moscow
  [30.3, 59.9, 0.6],  // St Petersburg
  [26.1, 44.4, 0.5],  // Bucharest
  [19.1, 47.5, 0.5],  // Budapest
  [12.6, 55.7, 0.5],  // Copenhagen
  [-6.3, 53.3, 0.4],  // Dublin
  [29, 41, 0.9],      // Istanbul

  // Asia
  [116.4, 39.9, 1],   // Beijing
  [121.5, 31.2, 1],   // Shanghai
  [113.3, 23.1, 0.9], // Guangzhou
  [114.1, 22.3, 0.8], // Hong Kong
  [114, 30.6, 0.7],   // Wuhan
  [104.1, 30.6, 0.7], // Chengdu
  [106.7, 26.6, 0.5], // Guiyang
  [108.9, 34.3, 0.5], // Xi'an
  [139.7, 35.7, 1],   // Tokyo
  [135.5, 34.7, 0.8], // Osaka
  [127, 37.6, 0.9],   // Seoul
  [77.2, 28.6, 0.9],  // Delhi
  [72.9, 19.1, 0.9],  // Mumbai
  [77.6, 13, 0.7],    // Bangalore
  [88.4, 22.6, 0.7],  // Kolkata
  [80.3, 13.1, 0.6],  // Chennai
  [78.5, 17.4, 0.6],  // Hyderabad
  [90.4, 23.8, 0.7],  // Dhaka
  [100.5, 13.8, 0.7], // Bangkok
  [106.8, 10.8, 0.6], // Ho Chi Minh
  [106.8, -6.2, 0.8], // Jakarta
  [103.9, 1.3, 0.7],  // Singapore
  [101.7, 3.1, 0.6],  // Kuala Lumpur
  [121, 14.6, 0.6],   // Manila
  [67, 24.9, 0.7],    // Karachi
  [74.3, 31.5, 0.6],  // Lahore
  [51.4, 35.7, 0.7],  // Tehran
  [44.4, 33.3, 0.5],  // Baghdad
  [46.7, 24.7, 0.6],  // Riyadh
  [55.3, 25.3, 0.7],  // Dubai
  [34.8, 31.8, 0.5],  // Tel Aviv

  // Africa
  [31.2, 30, 0.8],    // Cairo
  [3.4, 6.5, 0.7],    // Lagos
  [28.1, -26.2, 0.7], // Johannesburg
  [36.8, -1.3, 0.5],  // Nairobi
  [32.6, 0.3, 0.4],   // Kampala
  [3, 36.8, 0.5],     // Algiers
  [-7.6, 33.6, 0.5],  // Casablanca
  [38.7, 9, 0.5],     // Addis Ababa
  [13.2, -8.8, 0.4],  // Luanda
  [-17.5, 14.7, 0.3], // Dakar

  // Oceania
  [151.2, -33.9, 0.8], // Sydney
  [145, -37.8, 0.7],   // Melbourne
  [153, -27.5, 0.5],   // Brisbane
  [174.8, -41.3, 0.4], // Wellington
  [174.8, -36.9, 0.5], // Auckland
];
