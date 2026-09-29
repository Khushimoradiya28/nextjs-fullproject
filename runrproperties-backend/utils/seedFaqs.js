const Faq = require('../models/Faq');

const initialFaqs = [
  {
    question: "What is the minimum income required for a home loan?",
    answer: "Most banks require a minimum monthly income of ₹25,000 for salaried individuals and ₹3 Lakh annual income for self-employed applicants.",
    order: 1,
    isActive: true,
  },
  {
    question: "What documents are needed for home loan application?",
    answer: "You'll need identity proof, address proof, income proof (salary slips/ITR), bank statements (6 months), property documents, and passport-size photographs.",
    order: 2,
    isActive: true,
  },
  {
    question: "How long does the home loan approval take?",
    answer: "Typically 7-15 working days from application submission, depending on document verification and property valuation.",
    order: 3,
    isActive: true,
  },
  {
    question: "Can I prepay my home loan without penalty?",
    answer: "Yes, as per RBI guidelines, banks cannot charge prepayment penalty on floating rate home loans for individual borrowers.",
    order: 4,
    isActive: true,
  },
  {
    question: "What is the maximum tenure for a home loan?",
    answer: "Most banks offer home loans for up to 30 years, subject to the borrower's age at loan maturity not exceeding 60-65 years.",
    order: 5,
    isActive: true,
  },
];

const seedFaqs = async () => {
  try {
    const count = await Faq.countDocuments();
    if (count === 0) {
      await Faq.insertMany(initialFaqs);
      console.log('[SEED] Initial FAQs seeded successfully');
    }
  } catch (error) {
    console.error('[SEED] Error seeding FAQs:', error.message);
  }
};

module.exports = seedFaqs;
