// Stealth Agency - Advertising Management Data
// Sourced from Optimization Log & Weekly Lead Check spreadsheets

export const overviewMetrics = {
  totalSpent: 10484.08,
  totalSpentByCloser: { Will: 1828.62, Erik: 2316.25, Willian: 3047.70 },
  totalSpentByProduct: { "Agency Services": 9030.45, Outsourcing: 1453.63, "One-stop-shop": 0, "YouTube/Podcast": 145.90, Engagement: 305.66 },
  callsBooked: 86,
  callsCompleted: 59,
  showUpCalls: 45,
  clientCount: 15,
  newRevenue: 19115.00,
  oneTimeRevenue: 6600.00,
  recurringRevenue: 12515.00,
  totalROAS: 1.75,
  roasByCloser: { Will: 2.65, Erik: 2.01, Willian: 3.16 },
  cplAll: 121.91,
  cplPaid: 180.76,
  cac: 698.94,
  cacByCloser: { Will: 457.15, Erik: 386.04, Willian: 609.54 },
  conversionRate: 17.44,
  conversionRateByCloser: { Will: 26.67, Erik: 31.58, Willian: 20.00 },
  showUpConversionRate: 25.42,
  averageTicket: 1274.33,
  averageTicketByCloser: { Will: 1210.00, Erik: 775.83, Willian: 1924.00 },
  month: "March 2026",
};

export type LeadStage = "Cold Lead" | "General Lead" | "Hot Lead" | "Unpaid Invoice" | "Opportunity Won" | "Not a good fit" | "No Show";

export interface Lead {
  closer: string;
  name: string;
  firstCallDate: string;
  showUp: boolean;
  pipelineStage: LeadStage;
  company: string;
  service: string;
  source: string;
  dealSize: number;
  qualification: string;
  utm: string;
  reason?: string;
  nextSteps?: string;
}

export const leads: Lead[] = [
  { closer: "Will", name: "Ariz", firstCallDate: "01/19/2026", showUp: true, pipelineStage: "Cold Lead", company: "Vitality", service: "WL", source: "Direct Traffic", dealSize: 247, qualification: "MQL", utm: "Organic Search", reason: "No clients" },
  { closer: "Will", name: "Joshua", firstCallDate: "01/19/2026", showUp: true, pipelineStage: "General Lead", company: "Moreopportunity.io", service: "WL", source: "Paid Ads", dealSize: 690, qualification: "MQL", utm: "AD322 - Your full marketing team for $690, #1", reason: "No clients" },
  { closer: "Will", name: "Aashish", firstCallDate: "01/20/2026", showUp: true, pipelineStage: "Hot Lead", company: "Cardinal Heating", service: "CA", source: "Paid Ads", dealSize: 1797, qualification: "SQL", utm: "AD01 - Get premium Brazil-based" },
  { closer: "Will", name: "Ron", firstCallDate: "01/20/2026", showUp: true, pipelineStage: "Hot Lead", company: "Blue Gorilla 4", service: "WL", source: "Paid Ads", dealSize: 2100, qualification: "SQL", utm: "AD361 - Focus on scaling your agency" },
  { closer: "Will", name: "Travis", firstCallDate: "01/21/2026", showUp: true, pipelineStage: "Hot Lead", company: "Mid Atlantic Hoods", service: "Recruiting", source: "Paid Ads", dealSize: 2000, qualification: "SQL", utm: "AD01 - Get premium Brazil-based" },
  { closer: "Will", name: "Shawn", firstCallDate: "01/22/2026", showUp: true, pipelineStage: "Hot Lead", company: "Titan marketing", service: "Recruiting", source: "Social Media", dealSize: 2000, qualification: "SQL", utm: "AD30 - Scaling your agency is great" },
  { closer: "Will", name: "Luis Zambrano", firstCallDate: "01/28/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Aparavi", service: "Recruiting", source: "Paid Social", dealSize: 2000, qualification: "SQL", utm: "AD366 - Your full marketing team for $690, #4" },
  { closer: "Will", name: "Seshan", firstCallDate: "01/29/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Bespoke AI", service: "WL", source: "Direct Traffic", dealSize: 690, qualification: "SQL", utm: "Direct Traffic" },
  { closer: "Will", name: "Erik", firstCallDate: "01/30/2026", showUp: true, pipelineStage: "Unpaid Invoice", company: "Hyperbaric Acquisition", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Will", name: "Jason", firstCallDate: "02/02/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Hero Brands", service: "CA", source: "Paid Social", dealSize: 1797, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Will", name: "Kyle", firstCallDate: "02/02/2026", showUp: true, pipelineStage: "Unpaid Invoice", company: "Macrogrowth Analytics", service: "CA + Social", source: "Organic Search", dealSize: 2000, qualification: "SQL", utm: "AD366 - Your full marketing team for $690, #4" },
  { closer: "Will", name: "Nina", firstCallDate: "02/03/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Agency Ten10", service: "CA", source: "Paid Social", dealSize: 1200, qualification: "SQL", utm: "AD366 - Your full marketing team for $690, #4" },
  { closer: "Will", name: "Keith", firstCallDate: "02/10/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Austin Bryant Consulting", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Will", name: "Ilya", firstCallDate: "02/09/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Roxfire", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Will", name: "Ihaab", firstCallDate: "02/16/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Majid Media", service: "CA", source: "Social Media", dealSize: 990, qualification: "SQL", utm: "Social Media" },
  { closer: "Will", name: "Walter", firstCallDate: "02/24/2026", showUp: true, pipelineStage: "Unpaid Invoice", company: "Sketch Haus", service: "CA", source: "Paid Social", dealSize: 990, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Erik", name: "Dennis", firstCallDate: "10/07/2025", showUp: true, pipelineStage: "Opportunity Won", company: "Dennis Co", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "Social media" },
  { closer: "Erik", name: "Alejandra", firstCallDate: "11/04/2025", showUp: true, pipelineStage: "Opportunity Won", company: "Alejandra Co", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "AD01 - Get premium Brazil-based" },
  { closer: "Erik", name: "Marcus", firstCallDate: "02/25/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Marcus Co", service: "Audit", source: "Paid Social", dealSize: 250, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Erik", name: "Tom", firstCallDate: "03/01/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Tom Co", service: "WL", source: "Paid Social", dealSize: 690, qualification: "SQL", utm: "Social media" },
  { closer: "Erik", name: "Tony", firstCallDate: "03/09/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Tony Co", service: "WL + AM", source: "Paid Social", dealSize: 1335, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Erik", name: "Matt", firstCallDate: "03/06/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Matt Co", service: "Recruiting", source: "Direct Traffic", dealSize: 1000, qualification: "SQL", utm: "Direct Traffic" },
  { closer: "Willian", name: "Kyle", firstCallDate: "02/21/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Kyle Co", service: "WL + CFAM", source: "Paid Social", dealSize: 990, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
  { closer: "Willian", name: "Coby Maresh", firstCallDate: "02/22/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Coby Co", service: "WL", source: "Paid Ads", dealSize: 1380, qualification: "SQL", utm: "Google Ads" },
  { closer: "Willian", name: "Adam Jass", firstCallDate: "03/03/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Adam Co", service: "WL", source: "Organic", dealSize: 650, qualification: "SQL", utm: "Organic search" },
  { closer: "Willian", name: "Liv Hajek", firstCallDate: "02/04/2026", showUp: true, pipelineStage: "Opportunity Won", company: "Liv Co", service: "Outsourcing", source: "Paid Social", dealSize: 5600, qualification: "SQL", utm: "AD322 - Your full marketing team for $690, #1" },
];

export const weeklyApproval = [
  { week: "19-Jan", total: 43, approved: 24, rate: 55.81 },
  { week: "26-Jan", total: 35, approved: 13, rate: 37.14 },
  { week: "02-Feb", total: 41, approved: 13, rate: 31.71 },
  { week: "09-Feb", total: 26, approved: 13, rate: 50.00 },
  { week: "16-Feb", total: 18, approved: 9, rate: 50.00 },
  { week: "23-Feb", total: 32, approved: 15, rate: 46.88 },
  { week: "02-Mar", total: 38, approved: 15, rate: 39.47 },
  { week: "09-Mar", total: 23, approved: 9, rate: 39.13 },
  { week: "16-Mar", total: 26, approved: 9, rate: 34.62 },
];

export const utmPerformance = [
  { utm: "AD322 - Your full marketing team for $690, #1", totalLeads: 103, hotRate: 12.62, wonRate: 8.74 },
  { utm: "AD366 - Your full marketing team for $690, #4", totalLeads: 9, hotRate: 0, wonRate: 0 },
  { utm: "AD366 + OSTS_AD02", totalLeads: 5, hotRate: 0, wonRate: 40.00 },
  { utm: "AD361 - Focus on scaling your agency", totalLeads: 4, hotRate: 25.00, wonRate: 0 },
  { utm: "AD364 - Fulfillment taken care, $690", totalLeads: 4, hotRate: 0, wonRate: 0 },
  { utm: "AD01 - Get premium Brazil-based", totalLeads: 2, hotRate: 100, wonRate: 0 },
  { utm: "AD358 - Want a reliable path to scale", totalLeads: 2, hotRate: 50, wonRate: 0 },
  { utm: "Google Ads", totalLeads: 6, hotRate: 0, wonRate: 0 },
  { utm: "AD30 - Scaling your agency (VIDEO)", totalLeads: 1, hotRate: 100, wonRate: 0 },
  { utm: "AD374 - Fulfill your 5-10 clients", totalLeads: 1, hotRate: 100, wonRate: 0 },
];

export const closerPerformance = [
  { name: "Will", calls: 15, completed: 15, showUp: 12, clients: 4, spent: 1828.62, revenue: 4840, roas: 2.65, convRate: 26.67, avgTicket: 1210, avgSalesCycle: 2.5 },
  { name: "Erik", calls: 19, completed: 19, showUp: 15, clients: 6, spent: 2316.25, revenue: 4655, roas: 2.01, convRate: 31.58, avgTicket: 775.83, avgSalesCycle: 73.75 },
  { name: "Willian", calls: 25, completed: 25, showUp: 18, clients: 5, spent: 3047.70, revenue: 9620, roas: 3.16, convRate: 20.0, avgTicket: 1924, avgSalesCycle: 13.25 },
];

export interface MaterialItem {
  id: string;
  type: "image" | "text" | "video";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  channel: string;
}

export const materials: MaterialItem[] = [
  { id: "1", type: "image", title: "AD322 - Static Banner v2", description: "Your full marketing team for $690 — updated green invoice design", status: "approved", submittedBy: "Joao", submittedAt: "03/10/2026", reviewedBy: "Will", channel: "Meta" },
  { id: "2", type: "video", title: "AD30 - Agency Scaling Testimonial", description: "Video testimonial from client about agency scaling results", status: "approved", submittedBy: "Joao", submittedAt: "03/08/2026", reviewedBy: "Erik", channel: "Meta" },
  { id: "3", type: "text", title: "Google Ads Copy - White Label", description: "New ad copy variations for Google Search campaigns targeting 'white label agency'", status: "pending", submittedBy: "Willian", submittedAt: "03/18/2026", channel: "Google" },
  { id: "4", type: "image", title: "AD375 - Bundle Offer Static", description: "Bundle promotion creative for full marketing team package", status: "pending", submittedBy: "Joao", submittedAt: "03/17/2026", channel: "Meta" },
  { id: "5", type: "video", title: "One-Stop-Shop Explainer", description: "30-second explainer video for the one-stop-shop service offering", status: "rejected", submittedBy: "Erik", submittedAt: "03/12/2026", reviewedBy: "Joao", channel: "Meta" },
  { id: "6", type: "text", title: "Email Sequence - Outsourcing", description: "3-part email nurture sequence for outsourcing leads", status: "pending", submittedBy: "Will", submittedAt: "03/19/2026", channel: "Email" },
];

export const integrations = [
  { name: "GoHighLevel", status: "connected" as const, lastSync: "2 min ago", leadsImported: 172 },
  { name: "Meta Ads", status: "connected" as const, lastSync: "5 min ago", leadsImported: 148 },
  { name: "Google Ads", status: "needs_attention" as const, lastSync: "2 hours ago", leadsImported: 6 },
];

export const userRoles = [
  { name: "Joao", role: "Admin", avatar: "J" },
  { name: "Will", role: "Closer", avatar: "W" },
  { name: "Erik", role: "Closer", avatar: "E" },
  { name: "Willian", role: "Closer", avatar: "Wn" },
  { name: "Sarah", role: "Media Buyer", avatar: "S" },
  { name: "Lucas", role: "Viewer", avatar: "L" },
];
