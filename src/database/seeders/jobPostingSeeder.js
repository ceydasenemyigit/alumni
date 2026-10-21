/**
 * JobPosting Seeder
 * Populates core and factory-generated career vacancies into PostgreSQL and in-memory models.
 */

const jobPostingFactory = require('../factories/jobPostingFactory');
const jobPostingModel = require('../../models/jobPostingModel');

const CORE_JOB_POSTINGS = [
  {
    title: 'Junior Full-Stack Engineer',
    company: 'Global Tech Solutions',
    location: 'Istanbul / Hybrid',
    employment_type: 'Full-Time',
    description: 'Join our core platform engineering team working with Node.js, Express, and PostgreSQL.',
    requirements: 'Proficiency in JavaScript/TypeScript, SQL, and REST APIs.',
    salary_range: '$40,000 - $60,000',
    application_url: 'https://careers.globaltech.example.com/apply/1',
    posted_by_user_id: 1,
    is_active: true,
    deadline: '2026-12-31'
  },
  {
    title: 'Summer Software Engineering Intern',
    company: 'CloudScale Dynamics',
    location: 'Remote',
    employment_type: 'Internship',
    description: 'Exciting 3-month paid summer internship program for junior/senior computer engineering students.',
    requirements: 'Strong foundational CS knowledge, data structures, and Git experience.',
    salary_range: '$25/hour',
    application_url: 'mailto:internships@cloudscale.example.com',
    posted_by_user_id: 3,
    is_active: true,
    deadline: '2026-05-15'
  },
  {
    title: 'Senior Backend Architect',
    company: 'FinTech Horizon',
    location: 'Istanbul / Hybrid',
    employment_type: 'Full-Time',
    description: 'Lead high-throughput payment processing architecture, distributed systems, and Kafka event streaming.',
    requirements: '5+ years Node.js or Go, PostgreSQL, Redis, Kubernetes, high availability system design.',
    salary_range: '$85,000 - $110,000',
    application_url: 'https://careers.fintechhorizon.example.com/apply/backend',
    posted_by_user_id: 1,
    is_active: true,
    deadline: '2026-11-30'
  },
  {
    title: 'Data Analyst & BI Specialist',
    company: 'Apex Data Insights',
    location: 'Maslak, Istanbul',
    employment_type: 'Full-Time',
    description: 'Transform raw product and alumni analytics into actionable business dashboards and forecasts.',
    requirements: 'SQL, Python/Pandas, PowerBI/Tableau, data warehousing fundamentals.',
    salary_range: '$45,000 - $65,000',
    application_url: 'https://careers.apexinsights.example.com/data-analyst',
    posted_by_user_id: 2,
    is_active: true,
    deadline: '2026-10-31'
  },
  {
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Nexus Cyber Systems',
    location: 'Ankara / Hybrid',
    employment_type: 'Full-Time',
    description: 'Manage AWS cloud infrastructure, Terraform IaC, GitHub Actions CI/CD pipelines, and observability.',
    requirements: 'AWS, Terraform, Docker, Kubernetes, Linux, Prometheus/Grafana.',
    salary_range: '$70,000 - $95,000',
    application_url: 'https://careers.nexuscyber.example.com/devops',
    posted_by_user_id: 3,
    is_active: true,
    deadline: '2026-12-15'
  },
  {
    title: 'Part-Time Frontend Developer',
    company: 'Creative Wave Studio',
    location: 'Remote',
    employment_type: 'Part-Time',
    description: 'Build modern responsive landing pages and interactive student/alumni portal user interfaces.',
    requirements: 'React/Next.js, Tailwind CSS, HTML5/CSS3, responsive design.',
    salary_range: '$25 - $35/hour',
    application_url: 'mailto:jobs@creativewave.example.com',
    posted_by_user_id: 1,
    is_active: true,
    deadline: '2026-08-31'
  }
];

/**
 * Seeds core job postings + factory-generated job postings
 */
async function seed(client = null) {
  const factoryJobs = jobPostingFactory.createMany(3, 1);
  const allJobs = [...CORE_JOB_POSTINGS, ...factoryJobs];

  console.log(`- Seeding ${allJobs.length} job postings (${CORE_JOB_POSTINGS.length} core + ${factoryJobs.length} factory generated)...`);

  if (client) {
    for (const job of allJobs) {
      await client.query(`
        INSERT INTO job_postings (title, company, location, employment_type, description, requirements, salary_range, application_url, posted_by_user_id, is_active, deadline)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING;
      `, [
        job.title,
        job.company,
        job.location || 'Remote',
        job.employment_type || 'Full-Time',
        job.description,
        job.requirements || null,
        job.salary_range || null,
        job.application_url || null,
        job.posted_by_user_id || null,
        job.is_active !== undefined ? job.is_active : true,
        job.deadline || null
      ]);
    }
  } else {
    // In-memory fallback
    for (const job of allJobs) {
      try {
        await jobPostingModel.create(job);
      } catch (e) {
        // Ignore duplicate or validation error if already exists
      }
    }
  }

  return allJobs;
}

module.exports = {
  seed,
  CORE_JOB_POSTINGS
};
