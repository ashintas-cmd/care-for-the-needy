export interface Trial {
  id: string;
  ctriNumber: string;
  title: string;
  scientificTitle: string;
  phase: string;
  condition: string;
  intervention: string;
  sponsor: string;
  sponsorType: string;
  recruitmentStatus: string;
  enrollmentTarget: number;
  enrolled: number;
  startDate: string;
  completionDate: string;
  studyType: string;
  studyDesign: string;
  allocation: string;
  masking: string;
  principalInvestigator: string;
  piAffiliation: string;
  sites: Site[];
  eligibility: Eligibility;
  outcomes: Outcome[];
  briefSummary: string;
  locations: string[];
  state: string;
  district: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  ethicsCommittee: string;
  dcgIApproval: string;
  lastUpdated: string;
  sourceUrl: string;
}

export interface Site {
  name: string;
  address: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
}

export interface Eligibility {
  minAge: string;
  maxAge: string;
  gender: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
}

export interface Outcome {
  type: string;
  name: string;
  timeframe: string;
}

// Sample data representing recruiting trials from CTRI
// In production, this would be fetched from CTRI API
export const recruitingTrials: Trial[] = [
  {
    id: "1",
    ctriNumber: "CTRI/2024/01/056789",
    title: "A Study to Evaluate the Efficacy and Safety of a New Drug in Patients with Type 2 Diabetes",
    scientificTitle: "A Randomized, Double-Blind, Placebo-Controlled Phase 3 Study to Evaluate the Efficacy and Safety of XYZ-123 in Patients with Type 2 Diabetes Mellitus",
    phase: "Phase 3",
    condition: "Type 2 Diabetes Mellitus",
    intervention: "XYZ-123 (Oral tablets, 50mg once daily)",
    sponsor: "Indian Pharma Research Ltd.",
    sponsorType: "Pharmaceutical industry-Indian",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 500,
    enrolled: 234,
    startDate: "2024-01-15",
    completionDate: "2026-06-30",
    studyType: "Interventional",
    studyDesign: "Randomized, Parallel Group Trial",
    allocation: "Randomized",
    masking: "Double Blind",
    principalInvestigator: "Dr. Rajesh Kumar",
    piAffiliation: "All India Institute of Medical Sciences, New Delhi",
    sites: [
      {
        name: "AIIMS New Delhi",
        address: "Ansari Nagar, New Delhi - 110029",
        city: "New Delhi",
        state: "Delhi",
        contactPerson: "Dr. Rajesh Kumar",
        phone: "+91-11-26588500"
      },
      {
        name: "PGIMER Chandigarh",
        address: "Sector 12, Chandigarh - 160012",
        city: "Chandigarh",
        state: "Chandigarh",
        contactPerson: "Dr. Sunita Sharma",
        phone: "+91-172-2747585"
      },
      {
        name: "JIPMER Puducherry",
        address: "Gorimedu, Puducherry - 605006",
        city: "Puducherry",
        state: "Puducherry",
        contactPerson: "Dr. Venkatesh",
        phone: "+91-413-2298271"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "70 Years",
      gender: "Both",
      inclusionCriteria: "Patients aged 18-70 years with diagnosed Type 2 Diabetes Mellitus, HbA1c between 7.0-10.5%, on stable dose of metformin for at least 3 months",
      exclusionCriteria: "Type 1 Diabetes, severe renal impairment, hepatic dysfunction, pregnant or lactating women, history of diabetic ketoacidosis"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Change in HbA1c from baseline to Week 24",
        timeframe: "24 weeks"
      },
      {
        type: "Secondary",
        name: "Change in fasting plasma glucose",
        timeframe: "24 weeks"
      },
      {
        type: "Secondary",
        name: "Proportion of patients achieving HbA1c < 7.0%",
        timeframe: "24 weeks"
      }
    ],
    briefSummary: "This study aims to evaluate the efficacy and safety of a new oral drug XYZ-123 in patients with Type 2 Diabetes Mellitus who are not adequately controlled on metformin alone. The study will assess the drug's ability to lower blood sugar levels and its safety profile over a 24-week treatment period.",
    locations: ["New Delhi", "Chandigarh", "Puducherry"],
    state: "Delhi",
    district: "New Delhi",
    contactPerson: "Dr. Rajesh Kumar",
    contactEmail: "rajesh.kumar@aiims.edu",
    contactPhone: "+91-11-26588500",
    ethicsCommittee: "AIIMS Ethics Committee, New Delhi",
    dcgIApproval: "Approved",
    lastUpdated: "2024-03-15",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56789"
  },
  {
    id: "2",
    ctriNumber: "CTRI/2024/02/056790",
    title: "Clinical Trial of Ayurvedic Formulation for Management of Osteoarthritis",
    scientificTitle: "A Prospective, Randomized, Open-Label, Parallel Group Study to Evaluate the Efficacy and Safety of Ayurvedic Formulation ARTH-50 in Patients with Knee Osteoarthritis",
    phase: "Phase 2",
    condition: "Osteoarthritis of Knee",
    intervention: "ARTH-50 (Ayurvedic formulation, 500mg twice daily)",
    sponsor: "Ministry of AYUSH, Government of India",
    sponsorType: "Government funding agency",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 300,
    enrolled: 156,
    startDate: "2024-02-01",
    completionDate: "2025-12-31",
    studyType: "Interventional",
    studyDesign: "Randomized, Parallel Group Trial",
    allocation: "Randomized",
    masking: "Open Label",
    principalInvestigator: "Dr. Priya Sharma",
    piAffiliation: "National Institute of Ayurveda, Jaipur",
    sites: [
      {
        name: "NIA Jaipur",
        address: "Amargarh, Jorawar Singh Gate, Jaipur - 302002",
        city: "Jaipur",
        state: "Rajasthan",
        contactPerson: "Dr. Priya Sharma",
        phone: "+91-141-2620310"
      },
      {
        name: "Gujarat Ayurved University",
        address: "Jamnagar - 361008",
        city: "Jamnagar",
        state: "Gujarat",
        contactPerson: "Dr. Amit Patel",
        phone: "+91-288-2554444"
      }
    ],
    eligibility: {
      minAge: "40 Years",
      maxAge: "75 Years",
      gender: "Both",
      inclusionCriteria: "Patients with knee osteoarthritis (Kellgren-Lawrence grade II-III), age 40-75 years, WOMAC pain score ≥ 30mm",
      exclusionCriteria: "Severe osteoarthritis requiring surgery, inflammatory arthritis, intra-articular steroid injection in last 3 months"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Change in WOMAC pain score",
        timeframe: "12 weeks"
      },
      {
        type: "Secondary",
        name: "Change in WOMAC function score",
        timeframe: "12 weeks"
      }
    ],
    briefSummary: "This study evaluates the efficacy and safety of an Ayurvedic formulation ARTH-50 in patients with knee osteoarthritis. The study will assess pain relief and functional improvement using validated WOMAC scores over 12 weeks.",
    locations: ["Jaipur", "Jamnagar"],
    state: "Rajasthan",
    district: "Jaipur",
    contactPerson: "Dr. Priya Sharma",
    contactEmail: "priya.sharma@nia.nic.in",
    contactPhone: "+91-141-2620310",
    ethicsCommittee: "NIA Ethics Committee, Jaipur",
    dcgIApproval: "Not Required",
    lastUpdated: "2024-03-10",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56790"
  },
  {
    id: "3",
    ctriNumber: "CTRI/2024/03/056791",
    title: "Study of a Novel Vaccine for Prevention of Dengue Fever",
    scientificTitle: "A Phase 2/3, Randomized, Placebo-Controlled, Multi-Center Study to Evaluate the Efficacy, Safety, and Immunogenicity of Dengue Vaccine DEN-001 in Healthy Adults",
    phase: "Phase 2/Phase 3",
    condition: "Dengue Fever Prevention",
    intervention: "DEN-001 (Recombinant dengue vaccine, 0.5ml intramuscular)",
    sponsor: "Bharat Biotech International Ltd.",
    sponsorType: "Pharmaceutical industry-Indian",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 2000,
    enrolled: 892,
    startDate: "2024-01-20",
    completionDate: "2027-01-20",
    studyType: "Interventional",
    studyDesign: "Randomized, Parallel Group, Placebo Controlled Trial",
    allocation: "Randomized",
    masking: "Quadruple Blind",
    principalInvestigator: "Dr. Krishna Ella",
    piAffiliation: "Bharat Biotech, Hyderabad",
    sites: [
      {
        name: "Bharat Biotech Clinical Trial Center",
        address: "Genome Valley, Hyderabad - 500078",
        city: "Hyderabad",
        state: "Telangana",
        contactPerson: "Dr. Krishna Ella",
        phone: "+91-40-27783456"
      },
      {
        name: "NIMS Hyderabad",
        address: "Punjagutta, Hyderabad - 500082",
        city: "Hyderabad",
        state: "Telangana",
        contactPerson: "Dr. S. Reddy",
        phone: "+91-40-23394267"
      },
      {
        name: "Victoria Hospital, Bengaluru",
        address: "Fort Road, Bengaluru - 560002",
        city: "Bengaluru",
        state: "Karnataka",
        contactPerson: "Dr. M. Patil",
        phone: "+91-80-26701150"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "60 Years",
      gender: "Both",
      inclusionCriteria: "Healthy adults aged 18-60 years, no history of dengue fever, no travel to dengue endemic areas in last 6 months",
      exclusionCriteria: "Immunocompromised individuals, pregnant women, history of severe allergic reactions to vaccines"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Prevention of symptomatic dengue fever",
        timeframe: "24 months"
      },
      {
        type: "Secondary",
        name: "Immunogenicity - Neutralizing antibody titers",
        timeframe: "Day 56 post-vaccination"
      }
    ],
    briefSummary: "This study evaluates a novel dengue vaccine DEN-001 for the prevention of dengue fever. The study will assess the vaccine's ability to prevent symptomatic dengue infection and its immunogenicity profile in healthy adults.",
    locations: ["Hyderabad", "Bengaluru"],
    state: "Telangana",
    district: "Hyderabad",
    contactPerson: "Dr. Krishna Ella",
    contactEmail: "krishna@bharatbiotech.com",
    contactPhone: "+91-40-27783456",
    ethicsCommittee: "Bharat Biotech Ethics Committee",
    dcgIApproval: "Approved",
    lastUpdated: "2024-03-12",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56791"
  },
  {
    id: "4",
    ctriNumber: "CTRI/2024/04/056792",
    title: "Behavioral Intervention for Smoking Cessation in Rural India",
    scientificTitle: "A Cluster Randomized Controlled Trial of a Community-Based Behavioral Intervention for Smoking Cessation in Rural Population of Uttar Pradesh",
    phase: "N/A",
    condition: "Tobacco Smoking",
    intervention: "Behavioral counseling (6 sessions over 3 months)",
    sponsor: "Indian Council of Medical Research (ICMR)",
    sponsorType: "Government funding agency",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 1000,
    enrolled: 445,
    startDate: "2024-03-01",
    completionDate: "2025-09-30",
    studyType: "Interventional",
    studyDesign: "Cluster Randomized Trial",
    allocation: "Randomized",
    masking: "Open Label",
    principalInvestigator: "Dr. Ravi Kant",
    piAffiliation: "King George's Medical University, Lucknow",
    sites: [
      {
        name: "KGMU Lucknow",
        address: "Chowk, Lucknow - 226003",
        city: "Lucknow",
        state: "Uttar Pradesh",
        contactPerson: "Dr. Ravi Kant",
        phone: "+91-522-2257450"
      },
      {
        name: "Rural Health Training Center, Sarojini Nagar",
        address: "Sarojini Nagar, Lucknow - 226008",
        city: "Lucknow",
        state: "Uttar Pradesh",
        contactPerson: "Dr. Meera Singh",
        phone: "+91-522-2257451"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "80 Years",
      gender: "Both",
      inclusionCriteria: "Current smokers (≥1 cigarette/day for ≥6 months), aged 18-80 years, willing to quit smoking, resident of selected villages",
      exclusionCriteria: "Current use of smoking cessation pharmacotherapy, severe psychiatric illness, terminal illness"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Biochemically verified smoking abstinence at 6 months",
        timeframe: "6 months"
      },
      {
        type: "Secondary",
        name: "Reduction in number of cigarettes per day",
        timeframe: "3 and 6 months"
      }
    ],
    briefSummary: "This study evaluates a community-based behavioral intervention for smoking cessation in rural Uttar Pradesh. The intervention includes counseling sessions delivered by trained health workers to help smokers quit.",
    locations: ["Lucknow"],
    state: "Uttar Pradesh",
    district: "Lucknow",
    contactPerson: "Dr. Ravi Kant",
    contactEmail: "ravi.kant@kgmu.edu.in",
    contactPhone: "+91-522-2257450",
    ethicsCommittee: "KGMU Ethics Committee, Lucknow",
    dcgIApproval: "Not Required",
    lastUpdated: "2024-03-08",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56792"
  },
  {
    id: "5",
    ctriNumber: "CTRI/2024/05/056793",
    title: "Stem Cell Therapy for Treatment of Knee Cartilage Defects",
    scientificTitle: "A Phase 1/2, Open-Label, Single-Arm Study to Evaluate the Safety and Efficacy of Autologous Mesenchymal Stem Cell Therapy in Patients with Knee Cartilage Defects",
    phase: "Phase 1/Phase 2",
    condition: "Knee Cartilage Defects",
    intervention: "Autologous Mesenchymal Stem Cells (Intra-articular injection)",
    sponsor: "Stem Cell Research Institute, Chennai",
    sponsorType: "Research institution",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 50,
    enrolled: 23,
    startDate: "2024-02-15",
    completionDate: "2026-02-15",
    studyType: "Interventional",
    studyDesign: "Single Arm Study",
    allocation: "Non-randomized",
    masking: "Open Label",
    principalInvestigator: "Dr. S. Ramesh",
    piAffiliation: "Stem Cell Research Institute, Chennai",
    sites: [
      {
        name: "Stem Cell Research Institute",
        address: "Taramani, Chennai - 600113",
        city: "Chennai",
        state: "Tamil Nadu",
        contactPerson: "Dr. S. Ramesh",
        phone: "+91-44-22541234"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "65 Years",
      gender: "Both",
      inclusionCriteria: "Patients with focal cartilage defects of knee (ICRS grade III-IV), age 18-65 years, failed conservative treatment",
      exclusionCriteria: "Diffuse osteoarthritis, inflammatory arthritis, previous knee surgery on affected joint, BMI > 35"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Safety - Incidence of adverse events",
        timeframe: "12 months"
      },
      {
        type: "Secondary",
        name: "Change in IKDC score",
        timeframe: "6 and 12 months"
      }
    ],
    briefSummary: "This study investigates the safety and efficacy of autologous mesenchymal stem cell therapy for treating knee cartilage defects. The therapy involves harvesting patient's own stem cells and injecting them into the affected knee joint.",
    locations: ["Chennai"],
    state: "Tamil Nadu",
    district: "Chennai",
    contactPerson: "Dr. S. Ramesh",
    contactEmail: "ramesh@stemcellchennai.org",
    contactPhone: "+91-44-22541234",
    ethicsCommittee: "Stem Cell Research Institute Ethics Committee",
    dcgIApproval: "Approved",
    lastUpdated: "2024-03-05",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56793"
  },
  {
    id: "6",
    ctriNumber: "CTRI/2024/06/056794",
    title: "Yoga and Meditation for Management of Hypertension",
    scientificTitle: "A Randomized Controlled Trial of Yoga and Meditation versus Standard Care for Management of Essential Hypertension",
    phase: "N/A",
    condition: "Hypertension",
    intervention: "Yoga and Meditation (60 minutes daily, 5 days/week for 12 weeks)",
    sponsor: "Patanjali Research Institute, Haridwar",
    sponsorType: "Research institution",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 400,
    enrolled: 189,
    startDate: "2024-01-10",
    completionDate: "2025-07-10",
    studyType: "Interventional",
    studyDesign: "Randomized, Parallel Group Trial",
    allocation: "Randomized",
    masking: "Open Label",
    principalInvestigator: "Dr. Y. Singh",
    piAffiliation: "Patanjali Research Institute, Haridwar",
    sites: [
      {
        name: "Patanjali Research Institute",
        address: "Patanjali Yogpeeth, Haridwar - 249405",
        city: "Haridwar",
        state: "Uttarakhand",
        contactPerson: "Dr. Y. Singh",
        phone: "+91-1334-244000"
      },
      {
        name: "AIIMS Rishikesh",
        address: "Virbhadra Road, Rishikesh - 249203",
        city: "Rishikesh",
        state: "Uttarakhand",
        contactPerson: "Dr. A. Joshi",
        phone: "+91-135-2462900"
      }
    ],
    eligibility: {
      minAge: "30 Years",
      maxAge: "70 Years",
      gender: "Both",
      inclusionCriteria: "Patients with essential hypertension (BP 140-179/90-109 mmHg), age 30-70 years, on stable antihypertensive medication",
      exclusionCriteria: "Secondary hypertension, severe hypertension (BP ≥ 180/110), heart failure, renal dysfunction"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Change in systolic blood pressure",
        timeframe: "12 weeks"
      },
      {
        type: "Secondary",
        name: "Change in diastolic blood pressure",
        timeframe: "12 weeks"
      }
    ],
    briefSummary: "This study evaluates the effect of a structured yoga and meditation program on blood pressure control in patients with hypertension. The intervention includes daily yoga practice and meditation sessions supervised by trained instructors.",
    locations: ["Haridwar", "Rishikesh"],
    state: "Uttarakhand",
    district: "Haridwar",
    contactPerson: "Dr. Y. Singh",
    contactEmail: "y.singh@patanjaliyogpeeth.org",
    contactPhone: "+91-1334-244000",
    ethicsCommittee: "Patanjali Research Institute Ethics Committee",
    dcgIApproval: "Not Required",
    lastUpdated: "2024-03-01",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56794"
  },
  {
    id: "7",
    ctriNumber: "CTRI/2024/07/056795",
    title: "Diagnostic Accuracy of AI-Based Tool for Detection of Diabetic Retinopathy",
    scientificTitle: "A Prospective, Multi-Center Study to Evaluate the Diagnostic Accuracy of an Artificial Intelligence-Based Tool for Detection of Diabetic Retinopathy from Fundus Photographs",
    phase: "N/A",
    condition: "Diabetic Retinopathy",
    intervention: "AI-based diagnostic tool (Non-invasive)",
    sponsor: "Bharat AI Research Center, Hisar",
    sponsorType: "Research institution",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 5000,
    enrolled: 2156,
    startDate: "2024-02-01",
    completionDate: "2025-08-31",
    studyType: "Observational",
    studyDesign: "Cross-sectional Study",
    allocation: "Non-randomized",
    masking: "Open Label",
    principalInvestigator: "Dr. Ashish Tripathi",
    piAffiliation: "Bharat AI Research Center, Hisar",
    sites: [
      {
        name: "Bharat AI Research Center",
        address: "Sector 14, Hisar - 125001",
        city: "Hisar",
        state: "Haryana",
        contactPerson: "Dr. Ashish Tripathi",
        phone: "+91-1662-267890"
      },
      {
        name: "PGI Rohtak",
        address: "Rohtak - 124001",
        city: "Rohtak",
        state: "Haryana",
        contactPerson: "Dr. P. Gupta",
        phone: "+91-1262-211300"
      },
      {
        name: "Civil Hospital, Hisar",
        address: "Hisar - 125001",
        city: "Hisar",
        state: "Haryana",
        contactPerson: "Dr. R. Devi",
        phone: "+91-1662-223456"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "90 Years",
      gender: "Both",
      inclusionCriteria: "Patients with known or suspected diabetes mellitus, age ≥ 18 years, able to undergo fundus photography",
      exclusionCriteria: "Media opacity precluding fundus visualization, previous vitreoretinal surgery, unwilling to participate"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Sensitivity and specificity of AI tool for detecting diabetic retinopathy",
        timeframe: "At time of screening"
      },
      {
        type: "Secondary",
        name: "Agreement between AI tool and expert ophthalmologist grading",
        timeframe: "At time of screening"
      }
    ],
    briefSummary: "This study evaluates an AI-based diagnostic tool for detecting diabetic retinopathy from fundus photographs. The tool uses deep learning algorithms to automatically identify signs of diabetic eye disease, potentially enabling screening in resource-limited settings.",
    locations: ["Hisar", "Rohtak"],
    state: "Haryana",
    district: "Hisar",
    contactPerson: "Dr. Ashish Tripathi",
    contactEmail: "Ash.intas@gmail.com",
    contactPhone: "+91-1662-267890",
    ethicsCommittee: "Bharat AI Research Center Ethics Committee",
    dcgIApproval: "Not Required",
    lastUpdated: "2024-03-14",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56795"
  },
  {
    id: "8",
    ctriNumber: "CTRI/2024/08/056796",
    title: "Probiotic Supplementation for Prevention of Antibiotic-Associated Diarrhea",
    scientificTitle: "A Randomized, Double-Blind, Placebo-Controlled Trial of Multi-Strain Probiotic Supplementation for Prevention of Antibiotic-Associated Diarrhea in Hospitalized Patients",
    phase: "Phase 4",
    condition: "Antibiotic-Associated Diarrhea",
    intervention: "Multi-strain Probiotic (Capsules, twice daily)",
    sponsor: "National Institute of Nutrition, Hyderabad",
    sponsorType: "Research institution",
    recruitmentStatus: "Recruiting",
    enrollmentTarget: 800,
    enrolled: 367,
    startDate: "2024-01-05",
    completionDate: "2025-01-05",
    studyType: "Interventional",
    studyDesign: "Randomized, Parallel Group, Placebo Controlled Trial",
    allocation: "Randomized",
    masking: "Double Blind",
    principalInvestigator: "Dr. V. Reddy",
    piAffiliation: "National Institute of Nutrition, Hyderabad",
    sites: [
      {
        name: "NIN Hyderabad",
        address: "Tarnaka, Hyderabad - 500007",
        city: "Hyderabad",
        state: "Telangana",
        contactPerson: "Dr. V. Reddy",
        phone: "+91-40-27197200"
      },
      {
        name: "Nizam's Institute of Medical Sciences",
        address: "Punjagutta, Hyderabad - 500082",
        city: "Hyderabad",
        state: "Telangana",
        contactPerson: "Dr. K. Rao",
        phone: "+91-40-23394267"
      }
    ],
    eligibility: {
      minAge: "18 Years",
      maxAge: "80 Years",
      gender: "Both",
      inclusionCriteria: "Hospitalized patients aged 18-80 years receiving antibiotic therapy, expected hospital stay ≥ 5 days",
      exclusionCriteria: "Pre-existing diarrhea, inflammatory bowel disease, immunocompromised state, probiotic use in last 2 weeks"
    },
    outcomes: [
      {
        type: "Primary",
        name: "Incidence of antibiotic-associated diarrhea",
        timeframe: "During antibiotic therapy and 2 weeks after"
      },
      {
        type: "Secondary",
        name: "Duration of diarrhea episodes",
        timeframe: "During study period"
      }
    ],
    briefSummary: "This study investigates whether probiotic supplementation can prevent antibiotic-associated diarrhea in hospitalized patients. The multi-strain probiotic contains beneficial bacteria that may help maintain gut health during antibiotic treatment.",
    locations: ["Hyderabad"],
    state: "Telangana",
    district: "Hyderabad",
    contactPerson: "Dr. V. Reddy",
    contactEmail: "v.reddy@nin.res.in",
    contactPhone: "+91-40-27197200",
    ethicsCommittee: "NIN Ethics Committee, Hyderabad",
    dcgIApproval: "Not Required",
    lastUpdated: "2024-03-11",
    sourceUrl: "https://ctri.nic.in/Clinicaltrials/pmaindet2.php?trialid=56796"
  }
];

// Helper functions
export const getRecruitingTrials = (): Trial[] => {
  return recruitingTrials.filter(t => t.recruitmentStatus === "Recruiting");
};

export const searchTrials = (query: string): Trial[] => {
  const lowerQuery = query.toLowerCase();
  return recruitingTrials.filter(t =>
    t.title.toLowerCase().includes(lowerQuery) ||
    t.condition.toLowerCase().includes(lowerQuery) ||
    t.intervention.toLowerCase().includes(lowerQuery) ||
    t.sponsor.toLowerCase().includes(lowerQuery) ||
    t.scientificTitle.toLowerCase().includes(lowerQuery)
  );
};

export const filterTrialsByCondition = (condition: string): Trial[] => {
  if (!condition || condition === "All") return recruitingTrials;
  return recruitingTrials.filter(t =>
    t.condition.toLowerCase().includes(condition.toLowerCase())
  );
};

export const filterTrialsByState = (state: string): Trial[] => {
  if (!state || state === "All") return recruitingTrials;
  return recruitingTrials.filter(t =>
    t.state.toLowerCase().includes(state.toLowerCase())
  );
};

export const filterTrialsByPhase = (phase: string): Trial[] => {
  if (!phase || phase === "All") return recruitingTrials;
  return recruitingTrials.filter(t =>
    t.phase.toLowerCase().includes(phase.toLowerCase())
  );
};

export const getUniqueConditions = (): string[] => {
  const conditions = new Set(recruitingTrials.map(t => t.condition));
  return ["All", ...Array.from(conditions)];
};

export const getUniqueStates = (): string[] => {
  const states = new Set(recruitingTrials.map(t => t.state));
  return ["All", ...Array.from(states)];
};

export const getUniquePhases = (): string[] => {
  const phases = new Set(recruitingTrials.map(t => t.phase));
  return ["All", ...Array.from(phases)];
};

export const getTrialById = (id: string): Trial | undefined => {
  return recruitingTrials.find(t => t.id === id);
};
