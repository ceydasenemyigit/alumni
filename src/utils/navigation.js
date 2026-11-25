/**
 * Dynamic Navigation System Utility
 * Generates role-aware navigation links, active page indicators,
 * contextual action buttons, and user badges for GUEST, STUDENT, ALUMNI, and ADMIN roles.
 */

function getNavigation(user, currentPath = '/') {
  const role = user && user.role ? String(user.role).toUpperCase() : 'GUEST';
  const cleanPath = (currentPath || '/').split('?')[0];

  let primaryLinks = [];
  let actionButtons = [];
  let userBadge = null;

  switch (role) {
    case 'ADMIN':
      primaryLinks = [
        { label: '🛡️ Dashboard', href: '/admin', active: cleanPath === '/admin' },
        { label: 'Users Governance', href: '/admin/users', active: cleanPath.startsWith('/admin/users') },
        { label: 'Job Moderation', href: '/admin/jobs', active: cleanPath.startsWith('/admin/jobs') },
        { label: 'Candidate Pipeline', href: '/admin/applications', active: cleanPath.startsWith('/admin/applications') },
        { label: 'Broadcasts', href: '/admin/announcements', active: cleanPath.startsWith('/admin/announcements') },
        { label: 'Public Portal', href: '/', active: cleanPath === '/' },
        { label: 'Swagger', href: '/api/swagger', active: cleanPath.startsWith('/api/swagger') }
      ];

      actionButtons = [
        { label: '🛡️ Admin Panel', href: '/admin', variant: 'primary', icon: '🛡️' },
        { label: '+ Post Vacancy', href: '/jobs/new', variant: 'utility' },
        { label: '+ Broadcast', href: '/admin/announcements', variant: 'utility' }
      ];

      userBadge = {
        label: 'ADMIN',
        cssClass: 'badge-admin',
        icon: '🛡️'
      };
      break;

    case 'STUDENT':
      primaryLinks = [
        { label: 'Home', href: '/', active: cleanPath === '/' },
        { label: 'Alumni Directory', href: '/users', active: cleanPath.startsWith('/users') },
        { label: 'Job Board', href: '/jobs', active: cleanPath.startsWith('/jobs') },
        { label: 'My Applications', href: '/applications', active: cleanPath.startsWith('/applications') },
        { label: 'Announcements', href: '/announcements', active: cleanPath.startsWith('/announcements') },
        { label: 'About', href: '/about', active: cleanPath.startsWith('/about') },
        { label: 'Swagger', href: '/api/swagger', active: cleanPath.startsWith('/api/swagger') }
      ];

      actionButtons = [
        { label: '✨ + Apply to Job', href: '/applications/new', variant: 'primary' },
        { label: '⚡ Claim Admin', href: '/admin/claim', variant: 'utility' }
      ];

      userBadge = {
        label: 'STUDENT',
        cssClass: 'badge-student',
        icon: '🎓'
      };
      break;

    case 'ALUMNI':
      primaryLinks = [
        { label: 'Home', href: '/', active: cleanPath === '/' },
        { label: 'Alumni Network', href: '/users', active: cleanPath.startsWith('/users') },
        { label: 'Job Board', href: '/jobs', active: cleanPath.startsWith('/jobs') },
        { label: 'Applications', href: '/applications', active: cleanPath.startsWith('/applications') },
        { label: 'Announcements', href: '/announcements', active: cleanPath.startsWith('/announcements') },
        { label: 'About', href: '/about', active: cleanPath.startsWith('/about') },
        { label: 'Swagger', href: '/api/swagger', active: cleanPath.startsWith('/api/swagger') }
      ];

      actionButtons = [
        { label: '+ Post Job', href: '/jobs/new', variant: 'utility' },
        { label: '+ Apply', href: '/applications/new', variant: 'utility' },
        { label: '⚡ Claim Admin', href: '/admin/claim', variant: 'utility' }
      ];

      userBadge = {
        label: 'ALUMNI',
        cssClass: 'badge-alumni',
        icon: '💼'
      };
      break;

    case 'GUEST':
    default:
      primaryLinks = [
        { label: 'Home', href: '/', active: cleanPath === '/' },
        { label: 'Directory', href: '/users', active: cleanPath.startsWith('/users') },
        { label: 'Job Board', href: '/jobs', active: cleanPath.startsWith('/jobs') },
        { label: 'Announcements', href: '/announcements', active: cleanPath.startsWith('/announcements') },
        { label: 'Brand', href: '/brand', active: cleanPath.startsWith('/brand') },
        { label: 'About', href: '/about', active: cleanPath.startsWith('/about') },
        { label: 'Swagger', href: '/api/swagger', active: cleanPath.startsWith('/api/swagger') }
      ];

      actionButtons = [
        { label: 'Sign In', href: '/login', variant: 'utility' },
        { label: '✨ Register', href: '/register', variant: 'primary' },
        { label: '+ Apply', href: '/applications/new', variant: 'utility' },
        { label: '🛡️ Admin Claim', href: '/admin/claim', variant: 'utility' }
      ];

      userBadge = null;
      break;
  }

  return {
    role,
    primaryLinks,
    actionButtons,
    userBadge,
    isAuthenticated: Boolean(user),
    user: user || null,
    currentPath: cleanPath
  };
}

module.exports = { getNavigation };
