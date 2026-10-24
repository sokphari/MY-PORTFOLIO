/**
 * Portfolio details are based on the CV screenshot provided by Nat Sokphary.
 * Edit this file to update the website. Project demo links remain blank unless supplied.
 * Professional references from the CV are intentionally not published on the public site.
 */
export const portfolio = {
  name: 'Nat Sokphary',
  initials: 'NS',
  title: 'Backend Developer',
  role: 'Backend Developer & Full Stack Development',
  location: 'Toul Kouk, Phnom Penh, Cambodia',
  university: 'Royal University of Phnom Penh (RUPP)',
  availability: 'Backend Developer · Full Stack Development',
  intro: 'a fourth-year Computer Science student and backend developer building RESTful APIs with PHP/Laravel and Java/Spring Boot.',
  about: 'Backend Developer and fourth-year Computer Science student with hands-on experience building RESTful APIs using Java/Spring Boot and PHP/Laravel. Skilled in JWT authentication, Docker, Redis, PostgreSQL, MySQL, and Clean Architecture. I enjoy designing secure, maintainable backend systems, optimizing performance, and continuously improving software quality.',
  email: 'natsokphary88@gmail.com',
  phone: '+855 76 802 0358',
  github: 'https://github.com/sokphari',
  telegram: 'https://t.me/sokphary',
  facebook: 'https://web.facebook.com/pa.re.503645',
  linkedin: '', // Add your LinkedIn profile URL here in the future.
  cvUrl: '', // Optional — add your original PDF to public/ and set this path.
  profileImage: '/profile.png',
  languages: ['Khmer — Fluent', 'English — Intermediate'],
  stack: [
    { category: '⚙ Backend Development', items: ['PHP', 'Laravel', 'Java', 'Spring Boot', 'Role-Based Access Control', 'REST API', 'API Integration', 'JWT'] },
    { category: '◇ Frontend Development', items: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Tailwind CSS', 'Bootstrap', 'Vite', 'Fetch API'] },
    { category: '▤ Database', items: ['PostgreSQL', 'MySQL', 'SQL', 'MySQL Workbench', 'Redis'] },
    { category: '⌘ Tools & DevOps', items: ['Git', 'GitHub', 'Docker', 'Docker Compose', 'Linux', 'Postman'] },
    { category: '↗ Services & APIs', items: ['OAuth 2.0', 'Cloudinary', 'KHQR / Bakong', 'REST APIs'] },
    { category: '◎ Languages', items: ['Khmer — Fluent', 'English — Intermediate'] },
  ],
  projects: [
    {
      id: 'ecommerce',
      title: 'E-Commerce System',
      category: 'Full Stack',
      label: 'CV PROJECT',
      description: 'Built an e-commerce platform with secure REST APIs, integrated Bakong payments, and deployment using Docker.',
      technologies: ['Laravel', 'JWT', 'PostgreSQL', 'Docker', 'React.js'],
      demo: '',
      github: '',
      appearance: 'commerce',
    },
    {
      id: 'sms',
      title: 'SMS System',
      category: 'Backend',
      label: 'CV PROJECT',
      description: 'Built a Clean Architecture REST API with JWT authentication and designed the database. The CV also notes a SQL Server deployment with Docker.',
      technologies: ['Spring Boot', 'JWT', 'PostgreSQL', 'Docker', 'React.js'],
      demo: '',
      github: '',
      appearance: 'attendance',
    },
  ],
  education: {
    label: 'BACHELOR OF SCIENCE · EXPECTED GRADUATION 2027',
    degree: 'Computer Science — Year 4',
    school: 'Royal University of Phnom Penh (RUPP)',
    description: 'Bachelor of Science in Computer Science. Currently in Year 4, with expected graduation in 2027.',
    areas: ['Computer Science', 'Year 4', 'Expected 2027'],
    status: 'Expected 2027',
  },
  experiences: [
    {
      label: 'PROFESSIONAL EXPERIENCE',
      title: 'Programming Instructor',
      organization: 'ETEC Center',
      period: 'July 2025 – Present',
      description: 'Teach PHP, Laravel, Java, and Spring Boot programming. Mentor students in developing RESTful APIs and applying clean code principles and best practices.',
      tags: ['PHP', 'Laravel', 'Java', 'Spring Boot', 'Mentoring', 'REST APIs'],
    },
  ],
};
