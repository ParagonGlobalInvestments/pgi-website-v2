/**
 * Seed CMS tables with existing hardcoded data from public pages.
 *
 * Usage: npx tsx scripts/seed-cms.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 * Idempotent: truncates all CMS tables then re-inserts.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================================
// Data: Officers
// ============================================================================
const officers = [
  { name: 'Matthew Geiling', title: 'Chief Executive Officer', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/matthew-geiling-7981a8212/' },
  { name: 'Thor Christianson', title: 'Chief Operating Officer (Value)', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/finnur-christianson/' },
  { name: 'Forrest Gao', title: 'Chief Operating Officer (Systematic)', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/forrest-gao-40477626a/' },
  { name: 'Stoyan Angelov', title: 'Chief Investment Officer', school: 'New York University', linkedin: 'https://www.linkedin.com/in/stoyan-angelov/' },
  { name: 'Leo Li', title: 'Chief Quantitative Researcher', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/leoliziqi/' },
  { name: 'Alejandro Alonso', title: 'Chief Technology Officer', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/alejandro-alonso-38344020b/' },
  { name: 'Anirudh Pottammal', title: 'Chief Technology Officer', school: 'New York University', linkedin: 'https://www.linkedin.com/in/anirudh-pottammal-01b186216/' },
];

// ============================================================================
// Data: Alumni Board
// ============================================================================
const alumniBoard = [
  { name: 'Jay Sivadas', company: 'Morgan Stanley', linkedin: 'https://www.linkedin.com/in/jaysivadas/' },
  { name: 'Daniel Labrador-Plata', company: 'Bank of America', linkedin: 'https://www.linkedin.com/in/daniellabrador-plata/' },
  { name: 'Erin Ku', company: 'RBC Capital Markets', linkedin: 'https://www.linkedin.com/in/erinku/' },
  { name: 'Bradley Yu', company: 'Eschaton Trading', linkedin: 'https://www.linkedin.com/in/bradley-yu-124537181/' },
  { name: 'Advay Mohindra', company: 'Citadel', linkedin: 'https://www.linkedin.com/in/advay-mohindra-a18663231/' },
  { name: 'Harrison Wang', company: 'Arrowstreet Capital', linkedin: 'https://www.linkedin.com/in/harrison-wang-591b95214/' },
];

// ============================================================================
// Data: Founders
// ============================================================================
const founders = [
  { name: 'Jay Sivadas', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/jay-sivadas-795698168/' },
  { name: 'Daniel Labrador', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/daniellabrador-plata/' },
  { name: 'Erin Ku', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/erinku/' },
];

// ============================================================================
// Data: Chapter Founders
// ============================================================================
const chapterFounders: { name: string; school: string; linkedin: string }[] = [
  // UChicago
  { name: 'Lucas Mantovani', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/lucas-mantovani-a446a61a9/' },
  { name: 'John Hahn', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/john-hahn-12a1861b6/' },
  { name: 'Brianna Liu', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/briannaliu3/' },
  { name: 'Raphael Jimenez', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/raphael-jimenez-658447205/' },
  { name: 'Advay Mohindra', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/advay-mohindra-a18663231/' },
  { name: 'Silvia Aydinyan', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/silviaaydinyan/' },
  { name: 'Jeffrey Kao', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/jeffrey-kao-5a06a7182/' },
  { name: 'Bradley Yu', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/bradley-yu-124537181/' },
  // UPenn
  { name: 'Arjun Neervanan', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/arjun-neervannan/' },
  { name: 'Saahil Kamulkar', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/saahil-kamulkar-8074431b4/' },
  { name: 'Ria Sharma', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/ria-sharma-b224241b3/' },
  { name: 'Daniel Barra', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/daniel-barra24/' },
  { name: 'Nicole Rong', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/nicolerong/' },
  { name: 'Olgierd Fudali', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/ofudali/' },
  { name: 'Aryan Singh', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/aryan-singh-37120515b/' },
  { name: 'Anthony Steimle', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/anthony-steimle/' },
  { name: 'Andy Mei', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/meia/' },
  { name: 'Grant Mao', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/grant-mao-513a92202/' },
  { name: 'Ashish Pothireddy', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/ashish-pothireddy/' },
  { name: 'Prithvi Bale', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/prithvi-kb/' },
  { name: 'Manya Gauba', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/manya-gauba/' },
  { name: 'Arman Ashaboglu', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/arman-ashaboglu/' },
  // NYU
  { name: 'Christopher Rosa', school: 'New York University', linkedin: 'https://www.linkedin.com/in/christopher-rosa-23608819a/' },
  { name: 'Elizabeth Grayfer', school: 'New York University', linkedin: 'https://www.linkedin.com/in/elizabeth-grayfer-246675221/' },
  { name: 'Rishi Subbaraya', school: 'New York University', linkedin: 'https://www.linkedin.com/in/rishi-subbaraya-bb78901bb/' },
  { name: 'Yihao Zhong', school: 'New York University', linkedin: 'https://www.linkedin.com/in/yihaozhong/' },
  { name: 'Harrison Du', school: 'New York University', linkedin: 'https://www.linkedin.com/in/harrison-du-a67722212/' },
  { name: 'Justin Singh', school: 'New York University', linkedin: 'https://www.linkedin.com/in/justin-singh-918147202/' },
  { name: 'Arthur Chen', school: 'New York University', linkedin: 'https://www.linkedin.com/in/arthur-chen43/' },
  // Columbia
  { name: 'Philip Bardon', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/philip-bardon-b19570236/' },
  { name: 'Ali Alomari', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/ali-alomari-567468263/' },
  { name: 'Colby Cox', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/colbymcox/' },
  { name: 'Robert Stankard', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/robert-stankard-881386237/' },
  { name: 'Nischal Chennuru', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/nischal-chennuru-6555441b3/' },
  { name: 'Harrison Wang', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/harrison-wang-591b95214/' },
  { name: 'Kaiji Uno', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/kaijiuno/' },
  { name: 'Olivia Stevens', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/olivia-stevens-8062821ba/' },
  { name: 'Kenny Zhu', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/kenny-zhu/' },
  { name: 'Emma Liu', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/emma-liu-2846b1252/' },
  { name: 'Tony Chen', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/haozhe-chen/' },
  { name: 'Anupam Bhakta', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/anupam-bhakta/' },
  { name: 'William Vietor', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/william-vietor/' },
  { name: 'Matthew Weng', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/matthewweng/' },
  // Brown
  { name: 'Sandra Martinez', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/sandra-martinez-6877aa1ab/' },
  { name: 'Nick Klatsky', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/nicholas-k-93108619b/' },
  { name: 'Tianyu Zhou', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/tianyu-raphael-zhou/' },
  { name: 'Advay Mansingka', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/advay-mansingka/' },
  { name: 'Luke Briody', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/luke-briody/' },
  { name: 'Angela Osei-Ampadu', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/angela-osei-ampadu-b21a92200/' },
  { name: 'Raymundo Chapa Ponce', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/raymundo-chapa-ponce-5a2a05203/' },
  { name: 'Finnur Christianson', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/finnur-christianson-7333b51a7/' },
  { name: 'Erica Li', school: 'Brown University', linkedin: 'https://www.linkedin.com/in/erica-li-b1108/' },
  // Cornell
  { name: 'Kate Michelini', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/katharine-michelini/' },
  { name: 'Flynn Kelleher', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/flynn-kelleher/' },
  { name: 'Max Koster', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/max-koster-/' },
  { name: 'Michael Negrea', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/michaelanegrea/' },
  { name: 'Leopold Home', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/leopold-horne/' },
  { name: 'Caroline Duthie', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/caroline-duthie-b7997822a/' },
  { name: 'Pranav Mishra', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/pranavmishra10/' },
  { name: 'Benjamin Collins', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/benjamin-h-collins/' },
  { name: 'Corey Wang', school: 'Cornell University', linkedin: 'https://www.linkedin.com/in/corey53w53/' },
  // Princeton
  { name: 'Brandon Hwang', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/brandon-hwang-66a352187/' },
  { name: 'Brandon Cheng', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/brandoncheng127/' },
  { name: 'Jack Deschenes', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/jackdeschenes/' },
  { name: 'Eli Soffer', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/elisoffer/' },
  { name: 'Samuel Henriques', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/samuelhhenriques/' },
  { name: 'Rebecca Zhu', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/rebecca-zhu-9631bb1a9/' },
  { name: 'Michael Deschenes', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/michaelndeschenes/' },
  { name: 'Jason Ciptonugroho', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/jason-ciptonugroho/' },
  { name: 'Ellie Mueller', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/elise-ellie-mueller-299ba2206/' },
  // Yale
  { name: 'Jack Stemerman', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/jack-stemerman-1768a3211/' },
  { name: 'Joshua Donovan', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/joshua-donovan-b98632237/' },
  { name: 'Matthew Neissen', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/matthew-neissen/' },
  { name: 'Daniel Siegel', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/daniel-siegel-b314841b2/' },
  { name: 'Charlie Stemerman', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/charlie-stemerman-yale/' },
];

// ============================================================================
// Data: Investment Committee
// ============================================================================
const investmentCommittee = [
  { name: 'Philip Bardon', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/philip-b-b19570236/' },
  { name: 'Jayanth Mammen', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/jayanth-mammen/' },
  { name: 'Clara Ee', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/claraee/' },
  { name: 'John Otto', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/john-otto1/' },
  { name: 'Eli Soffer', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/elisoffer/' },
  { name: 'Ashish Pothireddy', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/ashish-pothireddy/' },
  { name: 'Sean Oh', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/seanoh26/' },
  { name: 'Myles Spiess', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/myles-spiess-304313242/' },
  { name: 'Matthew Weng', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/matthewweng/' },
  { name: 'Jason Ciptonugroho', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/jason-ciptonugroho/' },
  { name: 'Stoyan Angelov', school: 'New York University', linkedin: 'https://www.linkedin.com/in/stoyan-angelov/' },
  { name: 'John Yi', school: 'New York University', linkedin: 'https://www.linkedin.com/in/john-hong-yi/' },
];

// ============================================================================
// Data: Portfolio Managers
// ============================================================================
const portfolioManagers = [
  { name: 'Philip Weaver', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/philip-weaver-28b097232/' },
  { name: 'Aryaman Rakhecha', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/aryaman-rakhecha/' },
  { name: 'Matthew Geiling', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/matthew-geiling-7981a8212/' },
  { name: 'Benson Wang', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/bensonw/' },
  { name: 'Joshua Donovan', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/joshua-donovan-b98632237/' },
  { name: 'Jack Stemerman', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/jack-stemerman-1768a3211/' },
  { name: 'Aetant Prakash', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/aetantprakash/' },
];

// ============================================================================
// Data: Value Analysts
// ============================================================================
const valueAnalysts = [
  { name: 'Risha Bhat', school: 'University of Pennsylvania' },
  { name: 'Aparna Vagvala', school: 'New York University' },
  { name: 'Braden Queen', school: 'University of Chicago' },
  { name: 'Justin Burks', school: 'Columbia University' },
  { name: 'Siena Verprauskus', school: 'University of Chicago' },
  { name: 'Aurian Azghandi', school: 'University of Chicago' },
  { name: 'Nicolas Tchkotoua', school: 'University of Chicago' },
  { name: 'Noor Kaur', school: 'University of Chicago' },
  { name: 'Tommy Soltanian', school: 'Columbia University' },
  { name: 'Nana Agyeman', school: 'Princeton University' },
  { name: 'Daniel Kim', school: 'Princeton University' },
  { name: 'Seoyun Kang', school: 'Princeton University' },
  { name: 'Bill Zhang', school: 'Columbia University' },
  { name: 'Sarang Kothari', school: 'University of Chicago' },
  { name: 'Julian Sweet', school: 'University of Chicago' },
  { name: 'Oliver Treen', school: 'University of Chicago' },
  { name: 'Marcella Rogerson', school: 'University of Chicago' },
  { name: 'Lucas Lu', school: 'Cornell University' },
  { name: 'Kartik Arora', school: 'New York University' },
  { name: 'Joshua Lou', school: 'University of Chicago' },
  { name: 'Andrew Chen', school: 'Columbia University' },
  { name: 'Max Ting', school: 'University of Chicago' },
  { name: 'Ivan Mikhaylov', school: 'University of Chicago' },
  { name: 'Riley Gilsenan', school: 'University of Chicago' },
  { name: 'Finnur Christianson', school: 'Brown University' },
  { name: 'Samuel Hwang', school: 'University of Chicago' },
  { name: 'David Chen', school: 'Columbia University' },
  { name: 'Nicholas Simon', school: 'Columbia University' },
  { name: 'Jessica Wang', school: 'Columbia University' },
  { name: 'Dylan Berretta', school: 'Princeton University' },
  { name: 'Robert Zhang', school: 'University of Chicago' },
  { name: 'Raghav Mohindra', school: 'University of Chicago' },
];

// ============================================================================
// Data: Quant Research Committee
// ============================================================================
const quantResearchCommittee = [
  { name: 'Soupy De', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/souptik-de-3b275122b' },
  { name: 'William Vietor', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/william-vietor-4b552022b' },
  { name: 'Samuel Henriques', school: 'Princeton University', linkedin: 'https://www.linkedin.com/in/samuel-henriques-62748122b' },
  { name: 'Ronak Datta', school: 'University of Chicago', linkedin: 'https://www.linkedin.com/in/ronak-datta-3b275122b' },
  { name: 'Anirudh Pottammal', school: 'New York University', linkedin: 'https://www.linkedin.com/in/anirudh-pottammal-01b186216' },
  { name: 'Sahishnu Hanumolu', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/sahishnu-hanumolu-3b275122b' },
  { name: 'Dominic Olaguera-Delogu', school: 'University of Pennsylvania', linkedin: 'https://www.linkedin.com/in/dominic-olaguera-delogu-3b275122b' },
  { name: 'Matthew Neissen', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/matthew-neissen-3b275122b' },
  { name: 'Daniel Siegel', school: 'Yale University', linkedin: 'https://www.linkedin.com/in/daniel-siegel-3b275122b' },
  { name: 'Ethan Chang', school: 'Columbia University', linkedin: 'https://www.linkedin.com/in/ethan-chang-3b275122b' },
];

// ============================================================================
// Data: Quant Analysts
// ============================================================================
const quantAnalysts = [
  { name: 'Aakshay Gupta', school: 'Cornell University' },
  { name: 'Andrew Da', school: 'Cornell University' },
  { name: 'Ann Li', school: 'New York University' },
  { name: 'Anthony Wong', school: 'Cornell University' },
  { name: 'Atishay Narayanan', school: 'Princeton University' },
  { name: 'Aurora Wang', school: 'Columbia University' },
  { name: 'Benjamin Weber', school: 'Princeton University' },
  { name: 'Benjamin Zhou', school: 'Princeton University' },
  { name: 'Brianna Wang', school: 'Columbia University' },
  { name: 'Connor Brown', school: 'Princeton University' },
  { name: 'Edward Stan', school: 'Columbia University' },
  { name: 'Joonseok Jung', school: 'Cornell University' },
  { name: 'Kayla Shan', school: 'Cornell University' },
  { name: 'Linglong Dai', school: 'Cornell University' },
  { name: 'Meghana Kesanapalli', school: 'Cornell University' },
  { name: 'Mikul Saravanan', school: 'Columbia University' },
  { name: 'Rohan Sabu', school: 'New York University' },
  { name: 'Siddharth Shastry', school: 'University of Chicago' },
  { name: 'Srirag Tavarti', school: 'Columbia University' },
  { name: 'Robert Liu', school: 'University of Chicago' },
  { name: 'Flynn Kelleher', school: 'Cornell University' },
  { name: 'Anupam Bhakta', school: 'Columbia University' },
  { name: 'Kaiji Uno', school: 'Columbia University' },
  { name: 'Lucas Tucker', school: 'University of Chicago' },
  { name: 'Sohini Banerjee', school: 'University of Chicago' },
  { name: 'Pranav Mishra', school: 'Cornell University' },
  { name: 'Helen Ho', school: 'New York University' },
  { name: 'Ece Tumer', school: 'University of Chicago' },
  { name: 'Aman Dhillon', school: 'University of Chicago' },
  { name: 'Nico Roth', school: 'University of Chicago' },
  { name: 'Nikhil Reddy', school: 'University of Chicago' },
  { name: 'Anthony Luo', school: 'University of Chicago' },
  { name: 'Farrell Wenardy', school: 'University of Chicago' },
  { name: 'William Li', school: 'University of Chicago' },
  { name: 'Kabir Buch', school: 'University of Chicago' },
  { name: 'Ishaan Sareen', school: 'University of Chicago' },
  { name: 'Koren Gila', school: 'University of Chicago' },
  { name: 'Yoyo Zhang', school: 'University of Chicago' },
  { name: 'Lars Barth', school: 'University of Chicago' },
  { name: 'Benjamin Levi', school: 'University of Chicago' },
  { name: 'Arav Saksena', school: 'University of Chicago' },
];

// ============================================================================
// Data: Recruitment Team
// ============================================================================
const recruitmentTeam = [
  { name: 'Aetant Prakash', title: 'Head of Recruitment', school: 'University of Chicago' },
  { name: 'Heath Winter', title: 'Recruiter', school: 'University of Chicago' },
  { name: 'Noor Kaur', title: 'Recruiter', school: 'University of Chicago' },
  { name: 'Krish Khanna', title: 'Recruiter', school: 'University of Chicago' },
];

// ============================================================================
// Data: Recruitment Config
// ============================================================================
const recruitmentConfig: Record<string, string> = {
  app_open_date: 'January 12',
  app_deadline: 'January 19, 11:59 PM',
  zoom_session_1_link: 'https://uchicago.zoom.us/meetings/93724594264/invitations?signature=HIwjcPthsxZIX0IoQa2mVVVqNtpNgNb5ZXj-QWwWplc',
  zoom_session_1_time: 'Wednesday January 14, 7PM ET',
  zoom_session_2_link: 'https://uchicago.zoom.us/meetings/97029407547/invitations?signature=N03Z6ZbwFqah1Weq3-kpou---nFrWjNQc-I1WyJxoes',
  zoom_session_2_time: 'Friday January 16, 5PM ET',
  education_eligibility: 'first-year students',
  fund_eligibility: 'second-year students',
};

// ============================================================================
// Data: Statistics
// ============================================================================
const statistics = [
  { key: 'fund_size', label: 'AUM', value: '$70,000', sort_order: 0 },
  { key: 'active_students', label: 'Active Members', value: '300+', sort_order: 1 },
  { key: 'applicants_interested', label: 'Annual Applicants', value: '~2,000', sort_order: 2 },
  { key: 'chapters', label: 'University Chapters', value: '8', sort_order: 3 },
];

// ============================================================================
// Data: Timeline
// ============================================================================
const timeline = [
  { title: 'Paragon is Founded', description: "Paragon Global Investments launches its first chapter with the goal of educating students on the interesection of value investing, software development, and quantitative finance.", event_date: '26th Dec, 2021', sort_order: 16 },
  { title: 'Paragon Investment Fund Launch', description: "Thanks to generous donors, Paragon Global Investments officially launches its flagship investment fund where students can invest into real publicly traded equities using value investing and quantitative based techniques.", event_date: '10th Sept, 2022', sort_order: 15 },
  { title: 'Paragon UPenn', description: 'Paragon Global Investments officially opens its second chapter at the University of Pennsylvania.', event_date: '2nd Oct, 2022', sort_order: 14 },
  { title: 'Non-Profit Recognition', description: 'Paragon is officially registered and recognized as a 501(c)(3) tax-exempt not-for-profit organization.', event_date: '12th Oct, 2022', sort_order: 13 },
  { title: 'WSO Partnership', description: 'Paragon partners with Wall Street Oasis, the largest community focused on careers in finance, to bring Paragon members exclusive resources and opportunities.', event_date: '6th March, 2023', sort_order: 12 },
  { title: 'Jane Street Sponsorship', description: 'Jane Street, one of the largest quantitative trading firms in the world, officially sponsors Paragon.', event_date: '24th March, 2023', sort_order: 11 },
  { title: 'Elevate Partnership', description: 'Paragon partners with Elevate--the largest recruiting platform for Investment Banking, Private Equity, and Hedge Funds--to bring exclusive recruiting opportunities to our students', event_date: '2nd April, 2023', sort_order: 10 },
  { title: 'DRW Sponsorship', description: 'DRW, one of the top quantitative trading firms in the US, sponsors Paragon.', event_date: '11th May, 2023', sort_order: 9 },
  { title: 'Citadel Sponsorship', description: 'Citadel, one of the largest hedge funds in the world with more than $60bn in AUM, sponsors Paragon.', event_date: '12th May, 2023', sort_order: 8 },
  { title: 'Kirkland and Ellis Partnership', description: 'Kirkland and Ellis, one of the largest law firms in the US, becomes the official legal advisor for PNG', event_date: '10th Jul, 2023', sort_order: 7 },
  { title: 'Paragon NYU', description: 'Paragon officially opens its third chapter at New York University.', event_date: '18th Aug, 2023', sort_order: 6 },
  { title: 'Visible Alpha Partnership', description: 'Visible Alpha, one of the largest financial data providers, partners with Paragon to give our students access to information to aid or investment research.', event_date: '30th Aug, 2023', sort_order: 5 },
  { title: 'CloudQuant/Kershner Partnership', description: 'CloudQuant and Paragon partner, which provides Paragon access to 15,000 alternative data sets to conduct signal research on!', event_date: '30th Sep, 2023', sort_order: 4 },
  { title: 'Paragon Columbia', description: 'Paragon officially opens its fourth chapter at Columbia University.', event_date: '5th Oct, 2023', sort_order: 3 },
  { title: 'Paragon Brown', description: 'Paragon officially opens its fifth chapter at Brown University.', event_date: '30th Oct, 2023', sort_order: 2 },
  { title: 'Paragon Cornell', description: 'Paragon officially opens its sixth chapter at Cornell University.', event_date: '18th Oct, 2023', sort_order: 1 },
  { title: 'BamSEC Partnership', description: 'Paragon and BamSEC partner to provide Paragon students with unparalleled access to financial information.', event_date: '15th Nov, 2023', sort_order: 0 },
];

// ============================================================================
// Data: Sponsors
// ============================================================================
const sponsors = [
  { name: 'citadel', display_name: 'Citadel', website: 'https://www.citadel.com/', image_path: '/images/companies/Citadel.png' },
  { name: 'citadel-securities', display_name: 'Citadel Securities', website: 'https://www.citadel.com/', image_path: '/images/companies/CitSec.png' },
  { name: 'de-shaw', display_name: 'D.E. Shaw & Co.', website: 'https://www.deshaw.com/', image_path: '/images/companies/DE-Shaw.png' },
  { name: 'imc', display_name: 'IMC', website: 'https://imc.com/', image_path: '/images/companies/imc.png' },
  { name: 'jane-street', display_name: 'Jane Street', website: 'https://www.janestreet.com/', image_path: '/images/companies/JaneStreet.png' },
  { name: 'drw', display_name: 'DRW', website: 'https://drw.com/', image_path: '/images/companies/drw.png' },
  { name: 'kalshi', display_name: 'Kalshi', website: 'https://kalshi.com/', image_path: '/images/companies/Kalshi_logo.png' },
  { name: 'kershner', display_name: 'Kershner Trading', website: 'https://www.kershnertrading.com/#/', image_path: '/images/companies/Kershner.png' },
  { name: 'adams-street', display_name: 'Adams Street Partners', website: 'https://www.adamsstreetpartners.com/', image_path: '/images/companies/AdamsStreet.png' },
  { name: 'arena', display_name: 'Arena', website: 'https://www.arenaco.com/', image_path: '/images/companies/Arena.png' },
  { name: 'radial-equity-partners', display_name: 'Radial Equity Partners', website: 'https://radialequity.com/', image_path: '/images/companies/RadialEquityPartners.png' },
];

const partners = [
  { name: 'kirkland', display_name: 'Kirkland & Ellis', website: 'https://www.kirkland.com/', image_path: '/images/companies/kirkland.png', description: "Kirkland & Ellis, one of the largest law firms in the United States, is Paragon's official legal advisor, actively helping spread the organization's mission to as many students as possible." },
  { name: 'databento', display_name: 'Databento', website: 'https://databento.com/', image_path: '/images/companies/databento.png', description: 'Databento is a leading provider of real-time and historical market data to leading institutional investors. Paragon and Databento are partnered to provide Paragon students with access to real-time and exclusive market data across equities, options, and forex data!' },
  { name: 'elevate', display_name: 'Elevate Career Network', website: 'https://www.elevatecareernetwork.com/', image_path: '/images/companies/Elevate.jpg', description: 'Paragon partnered with Elevate Career Network\u2014the largest Private Equity, Investment Banking, Venture Capital, Hedge Fund Network in North America and Europe\u2014to provide our members with exclusive access to recruiting opportunities in finance.' },
  { name: 'visible-alpha', display_name: 'Visible Alpha', website: 'https://visiblealpha.com/', image_path: '/images/companies/visiblealpha.png', description: 'Visible Alpha is a leading provider of market data, sell-side information, financial information, and other company analysis software. All Paragon investment analysts will have access to visible alpha software through their PMs, which will assist them in developing deeper insights into the companies Paragon researches.' },
  { name: 'wso', display_name: 'Wall Street Oasis', website: 'https://www.wallstreetoasis.com/', image_path: '/images/companies/WSO.png', description: 'Wall Street Oasis provides Paragon Global Investments members exclusive resources to prepare them for professional recruitment.' },
  { name: 'bamsec', display_name: 'BamSEC', website: 'https://www.bamsec.com/', image_path: '/images/companies/BamSEC.png', description: 'BamSEC is a leading online platform that allows users to more efficiently perform financial research when working with Securities and Exchange Commission (SEC) filings and earnings transcripts. BamSEC helps Paragon students analyze companies and build financial models for our investment pitches.' },
  { name: 'tegus', display_name: 'Tegus', website: 'https://www.tegus.com/', image_path: '/images/companies/Tegus.png', description: "Tegus, a leading investment research platform, is a partner of Paragon's Value Fund." },
  { name: 'edmund-sec', display_name: 'Edmund Securities', website: 'https://www.edmundsec.com/', image_path: '/images/companies/EdmundSEC.png', description: 'EdmundSEC is a leading provider of software that helps users efficiently perform financial research when working with SEC documents. The company leverages unique AI software to accelerate financial research. EdmundSEC helps students with their financial research and building financial models.' },
  { name: 'cloudquant', display_name: 'CloudQuant', website: 'https://www.cloudquant.com/', image_path: '/images/companies/CloudQuant.webp', description: 'The exclusive partnership between Paragon and CloudQuant gives Paragon quantitative analysts access to over 15,000 private alternative data sets for building models and developing signals, enabling PNG students to perform real quantitative research.' },
  { name: 'biws', display_name: 'Breaking Into Wall Street', website: 'https://breakingintowallstreet.com/', image_path: '/images/companies/BIWS-1.png', description: 'Breaking Into Wall Street is the premier financial modeling training platform for investment banking and private equity interviews.' },
  { name: 'hireflix', display_name: 'Hireflix', website: 'https://www.hireflix.com/', image_path: '/images/companies/Hireflix-2.png', description: 'Hireflix is a leading one-way video interview software platform. Hireflix has partnered with PGI to support our national recruitment efforts.' },
  { name: 'portfolio123', display_name: 'Portfolio123', website: 'https://www.portfolio123.com/', image_path: '/images/companies/Portfolio123.png', description: 'Portfolio123 enables portfolio managers and quantitative investors to develop advanced machine learning-driven quantitative portfolio strategies without writing any code. Combining advanced capabilities with user-friendly design, Portfolio123 significantly lowers R&D costs.' },
  { name: 'koyfin', display_name: 'Koyfin', website: 'https://www.koyfin.com/', image_path: '/images/companies/Koyfin-removebg-preview.png', description: 'Koyfin delivers institutional-grade market dashboards, charting, and analytics in an intuitive interface, helping PGI members monitor macro trends and single-name fundamentals fast.' },
  { name: 'onefinnet', display_name: 'OneFinnet', website: 'https://www.onefinnet.com/', image_path: '/images/companies/OneFinnet_white.png', description: 'OneFinnet aggregates global financial statements, consensus estimates, and ESG metrics into a single API so students can enrich research models with consistent, ready-to-use data.' },
  { name: 'recruitu', display_name: 'RecruitU', website: 'https://www.recruitu.ai/', image_path: '/images/companies/RecruitU_white_v2.png', description: 'RecruitU is a modern recruiting platform focused on business and finance roles, giving PGI talent teams streamlined tools to manage candidate pipelines and campus outreach.' },
];

// ============================================================================
// Seed functions
// ============================================================================

async function truncateAll() {
  console.log('Truncating all CMS tables...');
  for (const table of ['cms_people', 'cms_recruitment', 'cms_statistics', 'cms_timeline', 'cms_sponsors']) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`  Error truncating ${table}:`, error.message);
    else console.log(`  Cleared ${table}`);
  }
}

async function seedPeople(
  group_slug: string,
  data: { name: string; title?: string; school?: string; company?: string; linkedin?: string }[]
) {
  const rows = data.map((p, i) => ({
    group_slug,
    name: p.name,
    title: p.title ?? null,
    school: p.school ?? null,
    company: p.company ?? null,
    linkedin: p.linkedin ?? null,
    sort_order: i,
  }));
  const { error } = await supabase.from('cms_people').insert(rows);
  if (error) console.error(`  Error seeding cms_people (${group_slug}):`, error.message);
  else console.log(`  Seeded ${rows.length} ${group_slug}`);
}

async function seedRecruitment() {
  const rows = Object.entries(recruitmentConfig).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('cms_recruitment').insert(rows);
  if (error) console.error('  Error seeding cms_recruitment:', error.message);
  else console.log(`  Seeded ${rows.length} recruitment config entries`);
}

async function seedStatistics() {
  const { error } = await supabase.from('cms_statistics').insert(statistics);
  if (error) console.error('  Error seeding cms_statistics:', error.message);
  else console.log(`  Seeded ${statistics.length} statistics`);
}

async function seedTimeline() {
  const { error } = await supabase.from('cms_timeline').insert(timeline);
  if (error) console.error('  Error seeding cms_timeline:', error.message);
  else console.log(`  Seeded ${timeline.length} timeline events`);
}

async function seedSponsors() {
  const sponsorRows = sponsors.map((s, i) => ({ ...s, type: 'sponsor', sort_order: i }));
  const partnerRows = partners.map((p, i) => ({ ...p, type: 'partner', sort_order: i }));

  const { error: sErr } = await supabase.from('cms_sponsors').insert(sponsorRows);
  if (sErr) console.error('  Error seeding sponsors:', sErr.message);
  else console.log(`  Seeded ${sponsorRows.length} sponsors`);

  const { error: pErr } = await supabase.from('cms_sponsors').insert(partnerRows);
  if (pErr) console.error('  Error seeding partners:', pErr.message);
  else console.log(`  Seeded ${partnerRows.length} partners`);
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  console.log('=== CMS Seed Script ===\n');

  await truncateAll();
  console.log('\nSeeding people...');
  await seedPeople('officers', officers);
  await seedPeople('alumni-board', alumniBoard);
  await seedPeople('founders', founders);
  await seedPeople('chapter-founders', chapterFounders);
  await seedPeople('investment-committee', investmentCommittee);
  await seedPeople('portfolio-managers', portfolioManagers);
  await seedPeople('value-analysts', valueAnalysts);
  await seedPeople('quant-research-committee', quantResearchCommittee);
  await seedPeople('quant-analysts', quantAnalysts);
  await seedPeople('recruitment-team', recruitmentTeam);

  console.log('\nSeeding recruitment config...');
  await seedRecruitment();

  console.log('\nSeeding statistics...');
  await seedStatistics();

  console.log('\nSeeding timeline...');
  await seedTimeline();

  console.log('\nSeeding sponsors & partners...');
  await seedSponsors();

  console.log('\n=== Done ===');
}

main().catch(console.error);
