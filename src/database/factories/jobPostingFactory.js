/**
 * JobPosting Factory
 * Generates realistic job vacancy records with valid employment types, salaries, and requirements.
 */

const VALID_EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];

const JOB_TEMPLATES = [
  {
    title: 'Senior Backend Architect',
    company: 'FinTech Horizon',
    location: 'Istanbul / Hybrid',
    employment_type: 'Full-Time',
    description: 'Lead high-throughput payment processing architecture, distributed systems, and Kafka stream processing.',
    requirements: '5+ years Node.js or Go, PostgreSQL, Redis, Kubernetes, high availability design.',
    salary_range: '$85,000 - $110,000',
    application_url: 'https://careers.fintechhorizon.example.com/apply/backend'
  },
  {
    title: 'Data Analyst & BI Specialist',
    company: 'Apex Data Insights',
    location: 'Maslak, Istanbul',
    employment_type: 'Full-Time',
    description: 'Transform raw data into executive dashboards, financial forecasts, and user churn models.',
    requirements: 'SQL, Python/Pandas, PowerBI or Tableau, data warehousing experience.',
    salary_range: '$45,000 - $65,000',
    application_url: 'https://careers.apexinsights.example.com/data-analyst'
  },
  {
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Nexus Cyber Systems',
    location: 'Ankara / Hybrid',
    employment_type: 'Full-Time',
    description: 'Manage AWS cloud infrastructure, Terraform IaC, GitHub Actions CI/CD pipelines, and zero-trust security.',
    requirements: 'AWS, Terraform, Docker, Kubernetes, Linux sysadmin, monitoring with Prometheus/Grafana.',
    salary_range: '$70,000 - $95,000',
    application_url: 'https://careers.nexuscyber.example.com/devops'
  },
  {
    title: 'Part-Time Frontend Developer',
    company: 'Creative Wave Studio',
    location: 'Remote',
    employment_type: 'Part-Time',
    description: 'Build modern responsive landing pages, interactive micro-frontends, and client portal UI.',
    requirements: 'Proficiency in React/Next.js, TypeScript, Tailwind CSS, REST APIs.',
    salary_range: '$25 - $35/hour',
    application_url: 'mailto:jobs@creativewave.example.com'
  },
  {
    title: 'AI & Machine Learning Research Intern',
    company: 'DeepVision Labs',
    location: 'Istanbul / Hybrid',
    employment_type: 'Internship',
    description: 'Assist in training computer vision models, fine-tuning LLMs, and synthetic dataset generation.',
    requirements: 'PyTorch, Python, linear algebra fundamentals, computer science/engineering coursework.',
    salary_range: '$30/hour',
    application_url: 'https://deepvisionlabs.example.com/internships'
  },
  {
    title: 'Mobile Application Developer (Flutter / iOS)',
    company: 'SmartMobility Tech',
    location: 'Remote',
    employment_type: 'Contract',
    description: 'Deliver cross-platform mobile apps for smart transit tracking and micro-mobility operations.',
    requirements: 'Flutter, Dart, iOS/Android native APIs, Firebase, state management (Bloc/Riverpod).',
    salary_range: '$50,000 - $70,000',
    application_url: 'https://smartmobility.example.com/careers/mobile'
  }
];

let jobCounter = 0;

function create(userId = 1, overrides = {}) {
  const template = JOB_TEMPLATES[jobCounter % JOB_TEMPLATES.length];
  jobCounter++;

  const futureDeadline = new Date();
  futureDeadline.setDate(futureDeadline.getDate() + 45 + (jobCounter * 5));

  return {
    title: overrides.title || `${template.title} #${jobCounter}`,
    company: overrides.company || template.company,
    location: overrides.location || template.location,
    employment_type: overrides.employment_type || template.employment_type,
    description: overrides.description || template.description,
    requirements: overrides.requirements || template.requirements,
    salary_range: overrides.salary_range || template.salary_range,
    application_url: overrides.application_url || template.application_url,
    posted_by_user_id: overrides.posted_by_user_id || userId,
    is_active: overrides.is_active !== undefined ? overrides.is_active : true,
    deadline: overrides.deadline || futureDeadline.toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  };
}

function createMany(count = 4, userId = 1, overrides = {}) {
  return Array.from({ length: count }, () => create(userId, overrides));
}

module.exports = {
  create,
  createMany,
  VALID_EMPLOYMENT_TYPES,
  JOB_TEMPLATES
};
