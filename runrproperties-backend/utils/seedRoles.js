const Role = require('../models/Role');
const User = require('../models/User');

const defaultRoles = [
  {
    name: 'buyer',
    displayName: 'Property Buyer / Tenant',
    description: 'Can search properties, save wishlist, and send enquiries',
    permissions: ['view_properties', 'create_enquiry', 'manage_wishlist'],
    isActive: true,
  },
  {
    name: 'owner',
    displayName: 'Property Owner / Agent',
    description: 'Can post and manage properties and view incoming enquiries',
    permissions: ['view_properties', 'create_property', 'manage_own_properties', 'view_own_enquiries'],
    isActive: true,
  },
  {
    name: 'bank_partner',
    displayName: 'Bank / Lending Partner',
    description: 'Can manage loan offers and process received customer loan leads',
    permissions: ['manage_loan_offers', 'view_bank_leads', 'update_lead_status'],
    isActive: true,
  },
  {
    name: 'admin',
    displayName: 'Super Administrator',
    description: 'Full administrative access to manage users, properties, and bank partners',
    permissions: ['all_access'],
    isActive: true,
  },
];

const seedRoles = async () => {
  try {
    const seededMap = {};

    for (const roleDef of defaultRoles) {
      const role = await Role.findOneAndUpdate(
        { name: roleDef.name },
        { $setOnInsert: roleDef },
        { upsert: true, new: true }
      );
      seededMap[roleDef.name] = role._id;
    }
    console.log('[ROLES] Default roles initialized successfully');

    // Link existing users missing roleId to corresponding Role document
    const usersWithoutRoleId = await User.find({
      $or: [{ roleId: null }, { roleId: { $exists: false } }],
    }).select('_id role');

    if (usersWithoutRoleId.length > 0) {
      const bulkOps = usersWithoutRoleId.map((u) => ({
        updateOne: {
          filter: { _id: u._id },
          update: {
            $set: {
              roleId: seededMap[u.role] || seededMap['buyer'],
            },
          },
        },
      }));
      await User.bulkWrite(bulkOps);
      console.log(`[ROLES] Linked ${usersWithoutRoleId.length} existing users with role IDs`);
    }
  } catch (err) {
    console.error('[ROLES] Role initialization error:', err.message);
  }
};

module.exports = seedRoles;
