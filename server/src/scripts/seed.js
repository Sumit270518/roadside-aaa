const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const ServiceCategory = require('../models/ServiceCategory');
const PartnerProfile = require('../models/PartnerProfile');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const { ROLES, VERIFICATION_STATUS, PARTNER_TYPES } = require('../constants/roles');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../constants/status');

const DEFAULT_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Password@123';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Roadside123';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Cleaning up previous demo data...');
    // We clean up existing test users and entities deterministically
    const demoEmails = [
      'admin@roadside-aaa.com',
      'john.doe@example.com',
      'sarah.owner@example.com',
      'vikram.mechanic@example.com',
      'rajesh.quickfix@example.com',
      'amit.towing@example.com',
      'karan.pending@example.com',
    ];

    const existingUsers = await User.find({ email: { $in: demoEmails } });
    const userIds = existingUsers.map((u) => u._id);

    await Vehicle.deleteMany({ owner: { $in: userIds } });
    await PartnerProfile.deleteMany({ user: { $in: userIds } });
    await ServiceRequest.deleteMany({ customer: { $in: userIds } });
    await Review.deleteMany({ customer: { $in: userIds } });
    await Notification.deleteMany({ recipient: { $in: userIds } });
    await Complaint.deleteMany({ submittedBy: { $in: userIds } });
    await User.deleteMany({ email: { $in: demoEmails } });

    console.log('[Seed] Creating Service Categories...');
    const categoriesData = [
      {
        name: 'Breakdown Repair',
        slug: 'breakdown-repair',
        description: 'On-site engine, electrical, clutch, or mechanical diagnostic and quick repairs.',
        basePrice: 599,
        perKmRate: 0,
        icon: 'Wrench',
        isActive: true,
      },
      {
        name: 'Towing Service',
        slug: 'towing-service',
        description: 'Safe flatbed or wheel-lift towing to the nearest workshop or your preferred location.',
        basePrice: 1299,
        perKmRate: 40,
        icon: 'Truck',
        isActive: true,
      },
      {
        name: 'Battery Jump-Start',
        slug: 'battery-jump-start',
        description: 'Fast battery boost, terminal cleaning, and battery health diagnosis on the spot.',
        basePrice: 399,
        perKmRate: 0,
        icon: 'Zap',
        isActive: true,
      },
      {
        name: 'Flat Tire Repair',
        slug: 'flat-tire-repair',
        description: 'Puncture repair, air pressure check, or spare wheel replacement at your location.',
        basePrice: 349,
        perKmRate: 0,
        icon: 'Disc',
        isActive: true,
      },
      {
        name: 'Emergency Fuel Delivery',
        slug: 'emergency-fuel-delivery',
        description: 'Up to 5 Litres of Petrol or Diesel delivered directly to your stranded vehicle.',
        basePrice: 449,
        perKmRate: 15,
        icon: 'Fuel',
        isActive: true,
      },
    ];

    const categories = [];
    for (const cat of categoriesData) {
      let category = await ServiceCategory.findOne({ slug: cat.slug });
      if (!category) {
        category = await ServiceCategory.create(cat);
      } else {
        category.basePrice = cat.basePrice;
        category.perKmRate = cat.perKmRate;
        category.description = cat.description;
        await category.save();
      }
      categories.push(category);
    }

    console.log('[Seed] Creating Users...');
    // 1. Administrator
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@roadside-aaa.com',
      phone: '+91 98765 00001',
      password: ADMIN_PASSWORD,
      role: ROLES.ADMIN,
    });

    // 2. Vehicle Owners
    const ownerJohn = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 11111',
      password: DEFAULT_PASSWORD,
      role: ROLES.USER,
    });

    const ownerSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.owner@example.com',
      phone: '+91 98765 22222',
      password: DEFAULT_PASSWORD,
      role: ROLES.USER,
    });

    // 3. Mechanics (Partners)
    const mechanicVikram = await User.create({
      name: 'Vikram Sharma',
      email: 'vikram.mechanic@example.com',
      phone: '+91 98765 33333',
      password: DEFAULT_PASSWORD,
      role: ROLES.MECHANIC,
    });

    const mechanicRajesh = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh.quickfix@example.com',
      phone: '+91 98765 44444',
      password: DEFAULT_PASSWORD,
      role: ROLES.MECHANIC,
    });

    // 4. Towing Partner
    const towingAmit = await User.create({
      name: 'Amit Patel',
      email: 'amit.towing@example.com',
      phone: '+91 98765 55555',
      password: DEFAULT_PASSWORD,
      role: ROLES.TOWING_PARTNER,
    });

    // 5. Pending Partner Applicant
    const pendingKaran = await User.create({
      name: 'Karan Singh',
      email: 'karan.pending@example.com',
      phone: '+91 98765 66666',
      password: DEFAULT_PASSWORD,
      role: ROLES.MECHANIC,
    });

    console.log('[Seed] Creating Partner Profiles...');
    // Base coordinates around New Delhi / NCR for realistic local geospatial testing
    // Connaught Place: [77.2197, 28.6315]
    // South Extension: [77.2227, 28.5714]
    // Noida Sec 18: [77.3209, 28.5708]
    // Gurgaon CyberHub: [77.0878, 28.4950]

    const partnerVikram = await PartnerProfile.create({
      user: mechanicVikram._id,
      partnerType: PARTNER_TYPES.MECHANIC,
      businessName: 'Sharma 24/7 Mobile Auto Mechanics',
      description: 'Certified master technician with 12+ years experience. Rapid roadside breakdown and battery repair.',
      experienceYears: 12,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isAvailable: true,
      serviceRadiusKm: 25,
      address: 'Shop 14, Connaught Circle, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2197, 28.6315],
      },
      pricing: { baseFee: 499, perKmRate: 25, diagnosticFee: 250 },
      serviceCategories: [categories[0]._id, categories[2]._id, categories[3]._id],
      ratingSummary: { averageRating: 4.9, totalReviews: 48 },
    });

    const partnerRajesh = await PartnerProfile.create({
      user: mechanicRajesh._id,
      partnerType: PARTNER_TYPES.MECHANIC,
      businessName: 'QuickFix Auto Care & Puncture Squad',
      description: 'Specialists in tire punctures, battery jumpstarts, and on-spot electrical troubleshooting.',
      experienceYears: 7,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isAvailable: true,
      serviceRadiusKm: 20,
      address: 'Plot 45, South Extension Part 2, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2227, 28.5714],
      },
      pricing: { baseFee: 450, perKmRate: 20, diagnosticFee: 200 },
      serviceCategories: [categories[0]._id, categories[2]._id, categories[3]._id, categories[4]._id],
      ratingSummary: { averageRating: 4.8, totalReviews: 32 },
    });

    const partnerAmit = await PartnerProfile.create({
      user: towingAmit._id,
      partnerType: PARTNER_TYPES.TOWING,
      businessName: 'Apex Heavy Duty Flatbed Towing',
      description: '24/7 hydraulic flatbed recovery trucks for sedans, luxury SUVs, and commercial vehicles.',
      experienceYears: 10,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isAvailable: true,
      serviceRadiusKm: 50,
      address: 'Main Ring Road, Near AIIMS Flyover, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2100, 28.5670],
      },
      pricing: { baseFee: 1200, perKmRate: 40, diagnosticFee: 0 },
      serviceCategories: [categories[1]._id],
      ratingSummary: { averageRating: 4.95, totalReviews: 76 },
    });

    // Pending Partner
    await PartnerProfile.create({
      user: pendingKaran._id,
      partnerType: PARTNER_TYPES.MECHANIC,
      businessName: 'Karan Auto Electricians',
      description: 'Newly applied roadside mechanic seeking verification approval.',
      experienceYears: 3,
      verificationStatus: VERIFICATION_STATUS.PENDING,
      isAvailable: false,
      serviceRadiusKm: 15,
      address: 'Sec 62, Electronic City, Noida',
      location: {
        type: 'Point',
        coordinates: [77.3639, 28.6256],
      },
      pricing: { baseFee: 400, perKmRate: 20, diagnosticFee: 200 },
      serviceCategories: [categories[0]._id, categories[2]._id],
      ratingSummary: { averageRating: 5.0, totalReviews: 0 },
      documents: [
        {
          docType: 'business_license',
          docName: 'GST_Certificate_Karan.pdf',
          fileUrl: '/uploads/sample_license.pdf',
          verified: false,
        },
      ],
    });

    console.log('[Seed] Registering Vehicles...');
    const vehicle1 = await Vehicle.create({
      owner: ownerJohn._id,
      registrationNumber: 'DL01-AB-1234',
      vehicleType: 'car',
      make: 'Hyundai',
      model: 'Creta SX (O)',
      year: 2022,
      fuelType: 'petrol',
      color: 'Polar White',
      notes: 'Automatic transmission, comprehensive warranty',
    });

    const vehicle2 = await Vehicle.create({
      owner: ownerJohn._id,
      registrationNumber: 'DL04-CZ-8899',
      vehicleType: 'bike',
      make: 'Royal Enfield',
      model: 'Classic 350',
      year: 2021,
      fuelType: 'petrol',
      color: 'Stealth Black',
    });

    const vehicle3 = await Vehicle.create({
      owner: ownerSarah._id,
      registrationNumber: 'HR26-DQ-5678',
      vehicleType: 'suv',
      make: 'Tata',
      model: 'Nexon EV',
      year: 2023,
      fuelType: 'electric',
      color: 'Signature Teal',
    });

    console.log('[Seed] Creating Sample Bookings in Various Lifecycle States...');
    // 1. Completed Booking with review and invoice
    const completedBooking = await ServiceRequest.create({
      bookingReference: 'AAA-202610-C781',
      customer: ownerJohn._id,
      vehicle: vehicle1._id,
      vehicleSnapshot: {
        registrationNumber: vehicle1.registrationNumber,
        make: vehicle1.make,
        model: vehicle1.model,
        vehicleType: vehicle1.vehicleType,
        fuelType: vehicle1.fuelType,
      },
      serviceCategory: categories[2]._id, // Battery Jump-Start
      serviceCategorySnapshot: { name: categories[2].name, slug: categories[2].slug },
      breakdownDescription: 'Car battery completely dead after headlight left on overnight in office basement.',
      location: {
        type: 'Point',
        coordinates: [77.2150, 28.6280],
      },
      address: 'Barakhamba Road, Connaught Place, New Delhi',
      status: BOOKING_STATUS.COMPLETED,
      assignedPartner: partnerVikram._id,
      assignedPartnerUser: mechanicVikram._id,
      estimatedPrice: {
        base: 399,
        distanceRate: 0,
        estimatedDistanceKm: 1.2,
        estimatedTotal: 419,
        currency: 'INR',
      },
      finalPrice: {
        base: 399,
        distanceRate: 0,
        additionalCharges: [{ description: 'Heavy duty terminal cleaner spray', amount: 150 }],
        taxes: 27,
        total: 576,
        currency: 'INR',
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentMethod: PAYMENT_METHODS.CASH,
      },
      acceptedAt: new Date(Date.now() - 3600000 * 3),
      arrivedAt: new Date(Date.now() - 3600000 * 2.5),
      completedAt: new Date(Date.now() - 3600000 * 2),
      statusHistory: [
        { status: BOOKING_STATUS.REQUESTED, timestamp: new Date(Date.now() - 3600000 * 3.2), note: 'Service requested' },
        { status: BOOKING_STATUS.ACCEPTED, timestamp: new Date(Date.now() - 3600000 * 3), note: 'Accepted by Vikram' },
        { status: BOOKING_STATUS.ARRIVED, timestamp: new Date(Date.now() - 3600000 * 2.5), note: 'Mechanic arrived at location' },
        { status: BOOKING_STATUS.COMPLETED, timestamp: new Date(Date.now() - 3600000 * 2), note: 'Battery jumped and tested' },
      ],
      hasReview: true,
    });

    // Review for the completed booking
    await Review.create({
      bookingId: completedBooking._id,
      customer: ownerJohn._id,
      partner: partnerVikram._id,
      rating: 5,
      comment: 'Vikram arrived in just 18 minutes! Car started immediately and he checked alternator voltage too. Lifesaver!',
    });

    // 2. Active En-Route Booking (Towing)
    await ServiceRequest.create({
      bookingReference: 'AAA-202610-E902',
      customer: ownerSarah._id,
      vehicle: vehicle3._id,
      vehicleSnapshot: {
        registrationNumber: vehicle3.registrationNumber,
        make: vehicle3.make,
        model: vehicle3.model,
        vehicleType: vehicle3.vehicleType,
        fuelType: vehicle3.fuelType,
      },
      serviceCategory: categories[1]._id, // Towing
      serviceCategorySnapshot: { name: categories[1].name, slug: categories[1].slug },
      breakdownDescription: 'Suspension failure after hitting a deep pothole. Vehicle undriveable.',
      location: {
        type: 'Point',
        coordinates: [77.2250, 28.5680],
      },
      address: 'Near Moolchand Underpass, Ring Road, New Delhi',
      status: BOOKING_STATUS.EN_ROUTE,
      assignedPartner: partnerAmit._id,
      assignedPartnerUser: towingAmit._id,
      estimatedPrice: {
        base: 1299,
        distanceRate: 40,
        estimatedDistanceKm: 8,
        estimatedTotal: 1699,
        currency: 'INR',
      },
      tracking: {
        currentLocation: {
          type: 'Point',
          coordinates: [77.2180, 28.5675],
        },
        lastUpdatedAt: new Date(),
        heading: 85,
      },
      acceptedAt: new Date(Date.now() - 900000),
      statusHistory: [
        { status: BOOKING_STATUS.REQUESTED, timestamp: new Date(Date.now() - 1200000), note: 'Requested' },
        { status: BOOKING_STATUS.ACCEPTED, timestamp: new Date(Date.now() - 900000), note: 'Apex Towing dispatched' },
        { status: BOOKING_STATUS.EN_ROUTE, timestamp: new Date(Date.now() - 600000), note: 'Flatbed truck is 3 km away' },
      ],
    });

    // 3. New Booking in Searching state
    await ServiceRequest.create({
      bookingReference: 'AAA-202610-S110',
      customer: ownerJohn._id,
      vehicle: vehicle2._id,
      vehicleSnapshot: {
        registrationNumber: vehicle2.registrationNumber,
        make: vehicle2.make,
        model: vehicle2.model,
        vehicleType: vehicle2.vehicleType,
        fuelType: vehicle2.fuelType,
      },
      serviceCategory: categories[3]._id, // Flat Tire Repair
      serviceCategorySnapshot: { name: categories[3].name, slug: categories[3].slug },
      breakdownDescription: 'Rear tire punctured by nail. Bike parked on roadside.',
      location: {
        type: 'Point',
        coordinates: [77.2210, 28.5740],
      },
      address: 'South Extension Part 1, Near Metro Gate 2',
      status: BOOKING_STATUS.SEARCHING,
      estimatedPrice: {
        base: 349,
        distanceRate: 0,
        estimatedDistanceKm: 2,
        estimatedTotal: 366,
        currency: 'INR',
      },
      statusHistory: [
        { status: BOOKING_STATUS.REQUESTED, timestamp: new Date(Date.now() - 300000), note: 'Assistance requested' },
        { status: BOOKING_STATUS.SEARCHING, timestamp: new Date(Date.now() - 250000), note: 'Broadcasting to nearby puncture mechanics' },
      ],
    });

    console.log('[Seed] Creating Sample Notifications & Complaint...');
    await Notification.create({
      recipient: ownerJohn._id,
      type: 'service_completed',
      title: 'Service Completed',
      message: 'Your Battery Jump-Start service has been marked complete. Thank you for using Roadside AAA!',
      bookingId: completedBooking._id,
    });

    await Notification.create({
      recipient: adminUser._id,
      type: 'system',
      title: 'New Partner Verification Pending',
      message: 'Karan Auto Electricians has applied for mechanic partner onboarding.',
    });

    await Complaint.create({
      bookingId: completedBooking._id,
      submittedBy: ownerJohn._id,
      category: 'overcharging',
      description: 'Just inquiring about the terminal spray charge of ₹150. Everything else was smooth.',
      status: 'submitted',
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS READY FOR TESTING:');
    console.log('------------------------------------------------------');
    console.log('1. Administrator:');
    console.log('   Email:    admin@roadside-aaa.com');
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('2. Vehicle Owner (Customer):');
    console.log('   Email:    john.doe@example.com');
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('3. Mechanic Partner:');
    console.log('   Email:    vikram.mechanic@example.com');
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('4. Towing Partner:');
    console.log('   Email:    amit.towing@example.com');
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('5. Pending Partner Application:');
    console.log('   Email:    karan.pending@example.com');
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
