/**
 * Models & Relations Registry
 * Alumni Tracking System
 *
 * Defines and exports all domain models along with their relational associations:
 * 1. Department ||--o{ User (1:N - Department has many Users)
 * 2. User ||--o| AlumniProfile (1:1 - User has one Alumni Profile)
 * 3. User ||--o{ JobPosting (1:N - User posts/manages Job Postings)
 * 4. User ||--o{ Announcement (1:N - User authors/receives Announcements)
 * 5. User ||--o{ Application (1:N - User submits Applications)
 * 6. JobPosting ||--o{ Application (1:N - JobPosting receives Applications)
 * 7. User }o--o{ JobPosting (N:M - Users apply to JobPostings via Application action table)
 */

const User = require('./userModel');
const Department = require('./departmentModel');
const AlumniProfile = require('./alumniProfileModel');
const Announcement = require('./announcementModel');
const JobPosting = require('./jobPostingModel');
const Application = require('./applicationModel');

/**
 * Relational Association Schema & Metadata
 */
const relations = {
  Department: {
    hasMany: [
      { model: 'User', foreignKey: 'department_id', as: 'users' }
    ]
  },
  User: {
    belongsTo: [
      { model: 'Department', foreignKey: 'department_id', as: 'department' }
    ],
    hasOne: [
      { model: 'AlumniProfile', foreignKey: 'user_id', as: 'profile' }
    ],
    hasMany: [
      { model: 'JobPosting', foreignKey: 'posted_by_user_id', as: 'jobPostings' },
      { model: 'Announcement', foreignKey: 'author', as: 'announcements' },
      { model: 'Application', foreignKey: 'user_id', as: 'applications' }
    ],
    belongsToMany: [
      { model: 'JobPosting', through: 'Application', foreignKey: 'user_id', otherKey: 'job_posting_id', as: 'appliedJobs' }
    ]
  },
  AlumniProfile: {
    belongsTo: [
      { model: 'User', foreignKey: 'user_id', as: 'user' }
    ]
  },
  JobPosting: {
    belongsTo: [
      { model: 'User', foreignKey: 'posted_by_user_id', as: 'poster' }
    ],
    hasMany: [
      { model: 'Application', foreignKey: 'job_posting_id', as: 'applications' }
    ],
    belongsToMany: [
      { model: 'User', through: 'Application', foreignKey: 'job_posting_id', otherKey: 'user_id', as: 'applicants' }
    ]
  },
  Announcement: {
    belongsTo: [
      { model: 'User', foreignKey: 'author', as: 'author' }
    ]
  },
  Application: {
    belongsTo: [
      { model: 'User', foreignKey: 'user_id', as: 'applicant' },
      { model: 'JobPosting', foreignKey: 'job_posting_id', as: 'jobPosting' }
    ]
  }
};

module.exports = {
  User,
  Department,
  AlumniProfile,
  Announcement,
  JobPosting,
  Application,
  relations
};
