const Blog = require('../models/Blog');

const initialBlogs = [
  {
    title: 'Real Estate Trends in 2025',
    slug: 'real-estate-trends-2025',
    excerpt: 'A smart guide to the new market dynamics shaping investment choices across India.',
    category: 'Market Trends',
    coverImage: '/img/blog/1.jpg',
    author: 'runr team',
    readTime: '5 min',
    status: 'published',
    isFeatured: true,
    content: `<h2>The Market is Shifting</h2><p>The Indian real estate market in 2025 is witnessing significant transformation driven by technology, government policies, and changing buyer preferences. Cities like Ahmedabad, Surat, and Pune are emerging as top investment destinations.</p><p>Key factors driving growth include infrastructure development, RERA compliance improvements, and increasing demand for premium housing segments.</p><h2>Technology-Driven Buying</h2><p>Virtual tours, AI-powered recommendations, and blockchain-based property records are making transactions faster and more transparent. Buyers now research extensively online before site visits.</p><h2>Investment Opportunities</h2><p>Commercial real estate, fractional ownership, and REITs continue to offer diversified investment options for different budget ranges.</p><ul><li>Tier-2 cities showing 15-20% annual appreciation</li><li>Green-certified buildings commanding 8-12% premium</li><li>Co-living spaces gaining traction among millennials</li></ul>`,
  },
  {
    title: 'How to Choose the Right Property',
    slug: 'how-to-choose-right-property',
    excerpt: 'Practical tips for matching budget, location, and future value when buying.',
    category: 'Buying Guide',
    coverImage: '/img/blog/2.jpg',
    author: 'runr team',
    readTime: '4 min',
    status: 'published',
    isFeatured: true,
    content: `<h2>Define Your Requirements</h2><p>Start by listing your must-haves versus nice-to-haves. Consider factors like proximity to workplace, schools, hospitals, and public transport.</p><h2>Budget Planning</h2><p>Factor in not just the property cost but registration charges, stamp duty, maintenance deposits, and interior costs. Keep 10-15% buffer for unexpected expenses.</p><h2>Location Analysis</h2><p>Research upcoming infrastructure projects, metro connectivity plans, and neighborhood development. Properties near upcoming infrastructure see 20-30% appreciation.</p><ul><li>Check RERA registration of the project</li><li>Verify builder's track record and delivery history</li><li>Visit the site at different times of day</li><li>Talk to existing residents if possible</li></ul>`,
  },
  {
    title: 'Top Investment Locations in India',
    slug: 'top-investment-locations-india',
    excerpt: 'Discover the fastest-growing cities for real estate buyers and investors today.',
    category: 'Investment',
    coverImage: '/img/blog/3.jpg',
    author: 'runr team',
    readTime: '6 min',
    status: 'published',
    isFeatured: true,
    content: `<h2>Gujarat Leading the Way</h2><p>Gujarat continues to be a top investment destination with cities like Ahmedabad, Surat, and Gandhinagar offering excellent infrastructure and growing demand.</p><h2>Key Cities to Watch</h2><p>Ahmedabad's SG Highway corridor, Surat's diamond hub expansion areas, and Vadodara's IT-driven growth zones are delivering strong returns for early investors.</p><ul><li>Ahmedabad - 12-18% annual appreciation in key micro-markets</li><li>Surat - Affordable entry with high rental yields</li><li>Gandhinagar - GIFT City driving premium demand</li><li>Vadodara - IT corridor attracting young professionals</li></ul>`,
  },
  {
    title: 'Home Loan Tips for First-Time Buyers',
    slug: 'home-loan-tips-first-buyers',
    excerpt: 'Everything you need to know before applying for your first home loan.',
    category: 'Finance',
    coverImage: '/img/blog/4.jpg',
    author: 'runr team',
    readTime: '5 min',
    status: 'published',
    isFeatured: true,
    content: `<h2>Know Your Eligibility</h2><p>Banks typically offer 75-90% of property value as loan. Your EMI should not exceed 40-50% of your monthly income for comfortable repayment.</p><h2>Compare Interest Rates</h2><p>Even a 0.25% difference in interest rate can save lakhs over the loan tenure. Always compare offers from at least 3-4 banks before deciding.</p><h2>Documentation Ready</h2><p>Keep all documents organized before applying to speed up the process significantly.</p><ul><li>Maintain good credit score (750+) for best rates</li><li>Consider joint loans for higher eligibility</li><li>Opt for longer tenure but prepay when possible</li><li>Choose floating rate in falling interest regime</li></ul>`,
  },
  {
    title: 'Vastu Tips for Your New Home',
    slug: 'vastu-tips-new-home',
    excerpt: 'Simple vastu guidelines to bring positive energy to your living space.',
    category: 'Lifestyle',
    coverImage: '/img/blog/1.jpg',
    author: 'runr team',
    readTime: '3 min',
    status: 'published',
    isFeatured: false,
    content: `<h2>Entrance Direction</h2><p>North and east-facing entrances are considered most auspicious. Ensure the main door opens clockwise and is well-lit.</p><h2>Kitchen Placement</h2><p>The ideal kitchen location is the southeast corner of the house. The cook should face east while preparing food.</p><h2>Bedroom Guidelines</h2><p>Master bedroom should ideally be in the southwest. Avoid mirrors facing the bed and keep electronics minimal in sleeping areas.</p>`,
  },
  {
    title: 'Rental Market Guide 2025',
    slug: 'rental-market-guide-2025',
    excerpt: 'Understanding rental yields, tenant demands, and best cities for rental income.',
    category: 'Rental',
    coverImage: '/img/blog/2.jpg',
    author: 'runr team',
    readTime: '6 min',
    status: 'published',
    isFeatured: false,
    content: `<h2>Rental Yields in Gujarat</h2><p>Average rental yields in Gujarat range from 2.5% to 4.5% depending on location, property type, and furnishing level.</p><h2>Tenant Preferences</h2><p>Post-pandemic, tenants prioritize spacious layouts, work-from-home setups, good ventilation, and proximity to essential services.</p><h2>Tips for Landlords</h2><ul><li>Furnish smartly - semi-furnished attracts wider audience</li><li>Keep rent market-competitive with annual 5-8% revision</li><li>Maintain property well for long-term tenants</li><li>Use digital platforms for wider reach</li></ul>`,
  },
];

async function seedBlogs() {
  try {
    await Blog.updateMany({ author: /Runr/i }, { $set: { author: 'runr team' } });
    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany(initialBlogs);
      console.log(`[SEED] Seeded ${initialBlogs.length} initial blogs into database`);
    }
  } catch (err) {
    console.error('[SEED] Blog seed error:', err.message);
  }
}

module.exports = seedBlogs;
