import { DEFAULT_BANNER_IMAGE, DEFAULT_BRAND_COLOR, slugify } from './lmsMetadata';

const metadata = (name, overrides = {}) => ({
  slug: slugify(name),
  level: 'Beginner',
  language: 'English',
  estimatedDuration: '1 hour',
  brandColor: DEFAULT_BRAND_COLOR,
  bannerImage: DEFAULT_BANNER_IMAGE,
  icon: 'menu_book',
  ...overrides,
});

const cloudBanner = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
const reactBanner = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80';
const agileBanner = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80';
const dataBanner = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

const defaultCategories = [
  { id: 'cat-1', name: 'Cloud & Infrastructure', description: 'Google Cloud Platform, AWS, DevOps, and Kubernetes architectures.', status: 'Active', ...metadata('Cloud & Infrastructure', { level: 'Advanced', estimatedDuration: '40 hours', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'cloud' }) },
  { id: 'cat-2', name: 'Software Development', description: 'React, Next.js, Node.js, and Modern Javascript engineering.', status: 'Active', ...metadata('Software Development', { level: 'Intermediate', estimatedDuration: '55 hours', brandColor: '#61DAFB', bannerImage: reactBanner, icon: 'code' }) },
  { id: 'cat-3', name: 'Agile & Leadership', description: 'Scrum, Kanban, Agile coaching, and Product Management.', status: 'Active', ...metadata('Agile & Leadership', { level: 'Beginner', estimatedDuration: '24 hours', brandColor: '#FF6200', bannerImage: agileBanner, icon: 'groups' }) },
  { id: 'cat-4', name: 'Data & Artificial Intelligence', description: 'Machine Learning, BigQuery, Spark, and Generative AI.', status: 'Inactive', ...metadata('Data & Artificial Intelligence', { level: 'Advanced', estimatedDuration: '64 hours', brandColor: '#00A676', bannerImage: dataBanner, icon: 'psychology' }) },
];

const defaultCourses = [
  { id: 'course-1', categoryId: 'cat-1', name: 'Google Cloud Architect Academy', description: 'Master GCP services, VPCs, GKE clusters, and professional cloud architect practices.', thumbnail: cloudBanner, status: 'Active', ...metadata('Google Cloud Architect Academy', { level: 'Advanced', estimatedDuration: '28 hours', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'cloud_queue' }) },
  { id: 'course-2', categoryId: 'cat-2', name: 'Advanced React & Architecture Patterns', description: 'Explore performance optimization, custom hook frameworks, and global state topologies.', thumbnail: reactBanner, status: 'Active', ...metadata('Advanced React & Architecture Patterns', { level: 'Advanced', estimatedDuration: '32 hours', brandColor: '#0EA5E9', bannerImage: reactBanner, icon: 'integration_instructions' }) },
  { id: 'course-3', categoryId: 'cat-3', name: 'Certified Agile Professional Guide', description: 'Align team structures, manage backlogs, and run effective sprint ceremonies.', thumbnail: agileBanner, status: 'Active', ...metadata('Certified Agile Professional Guide', { level: 'Intermediate', estimatedDuration: '18 hours', brandColor: '#FF6200', bannerImage: agileBanner, icon: 'fact_check' }) },
];

const defaultModules = [
  { id: 'mod-1', courseId: 'course-1', name: 'Module 1: GCP Compute & Networking Foundations', description: 'Understand VPCs, Subnets, Compute Engines, and Cloud Load Balancers.', position: 1, ...metadata('GCP Compute & Networking Foundations', { level: 'Intermediate', estimatedDuration: '6 hours', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'settings_ethernet' }) },
  { id: 'mod-2', courseId: 'course-1', name: 'Module 2: Containerization with Google Kubernetes Engine (GKE)', description: 'Deploy, scale, and manage workloads on GKE.', position: 2, ...metadata('Containerization with Google Kubernetes Engine', { level: 'Advanced', estimatedDuration: '8 hours', brandColor: '#326CE5', bannerImage: cloudBanner, icon: 'hub' }) },
  { id: 'mod-3', courseId: 'course-1', name: 'Module 3: GCP Databases & Storage Systems', description: 'Compare Cloud SQL, Spanner, Bigtable, and Cloud Storage.', position: 3, ...metadata('GCP Databases & Storage Systems', { level: 'Advanced', estimatedDuration: '7 hours', brandColor: '#4285F4', bannerImage: cloudBanner, icon: 'storage' }) },
  { id: 'mod-4', courseId: 'course-2', name: 'Module 1: Rendering Strategies & Hydration', description: 'Client-side rendering, Server-side rendering, and Static site generation.', position: 1, ...metadata('Rendering Strategies & Hydration', { level: 'Advanced', estimatedDuration: '7 hours', brandColor: '#0EA5E9', bannerImage: reactBanner, icon: 'bolt' }) },
  { id: 'mod-5', courseId: 'course-2', name: 'Module 2: Custom Hook Architecture & Context API', description: 'Build reusable logic modules and separate state boundaries.', position: 2, ...metadata('Custom Hook Architecture & Context API', { level: 'Intermediate', estimatedDuration: '5 hours', brandColor: '#61DAFB', bannerImage: reactBanner, icon: 'account_tree' }) },
  { id: 'mod-6', courseId: 'course-3', name: 'Module 1: Agile Manifesto & Principles', description: 'Origins of agile, standard values, and core principles.', position: 1, ...metadata('Agile Manifesto & Principles', { level: 'Beginner', estimatedDuration: '4 hours', brandColor: '#FF6200', bannerImage: agileBanner, icon: 'record_voice_over' }) },
];

const defaultSubmodules = [
  { id: 'submod-1', moduleId: 'mod-1', name: 'Submodule 1.1: Designing Custom VPC Networks', description: 'Configuration of firewalls, subnets, and routing tables.', position: 1, ...metadata('Designing Custom VPC Networks', { level: 'Intermediate', estimatedDuration: '2 hours', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'lan' }) },
  { id: 'submod-2', moduleId: 'mod-1', name: 'Submodule 1.2: Compute Engine VM Deployments', description: 'Provisioning VMs, startup scripts, and instance templates.', position: 2, ...metadata('Compute Engine VM Deployments', { level: 'Intermediate', estimatedDuration: '2.5 hours', brandColor: '#34A853', bannerImage: cloudBanner, icon: 'dns' }) },
  { id: 'submod-3', moduleId: 'mod-2', name: 'Submodule 2.1: Pods, Services, and Deployments', description: 'Basic Kubernetes objects and workload specifications.', position: 1, ...metadata('Pods Services and Deployments', { level: 'Advanced', estimatedDuration: '3 hours', brandColor: '#326CE5', bannerImage: cloudBanner, icon: 'deployed_code' }) },
  { id: 'submod-4', moduleId: 'mod-2', name: 'Submodule 2.2: Scaling & Ingress Management', description: 'Horizontal pod autoscaling and GKE ingress controllers.', position: 2, ...metadata('Scaling & Ingress Management', { level: 'Advanced', estimatedDuration: '3 hours', brandColor: '#326CE5', bannerImage: cloudBanner, icon: 'swap_vert' }) },
  { id: 'submod-5', moduleId: 'mod-4', name: 'Submodule 4.1: React Server Components (RSC) Deep Dive', description: 'Understanding server vs client boundaries.', position: 1, ...metadata('React Server Components Deep Dive', { level: 'Advanced', estimatedDuration: '3 hours', brandColor: '#0EA5E9', bannerImage: reactBanner, icon: 'developer_board' }) },
];

const defaultContents = [
  { id: 'cont-1', submoduleId: 'submod-1', moduleId: 'mod-1', courseId: 'course-1', name: 'VPC Design Guide & Best Practices', contentType: 'PDF', description: 'Detailed architecture diagram and documentation for designing VPC networks.', fileName: 'gcp_vpc_design_patterns.pdf', fileSize: '4.2 MB', fileUrl: '#', status: 'Active', position: 1, ...metadata('VPC Design Guide & Best Practices', { level: 'Intermediate', estimatedDuration: '45 minutes', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'picture_as_pdf' }) },
  { id: 'cont-2', submoduleId: 'submod-1', moduleId: 'mod-1', courseId: 'course-1', name: 'VPC vs Shared VPC Comparison', contentType: 'Comparison Table', description: 'Feature grid comparing normal VPC networks against Shared VPCs in GCP.', fileName: 'vpc_shared_vpc_comparison.html', fileSize: '128 KB', fileUrl: '#', status: 'Reviewed', position: 2, ...metadata('VPC vs Shared VPC Comparison', { level: 'Intermediate', estimatedDuration: '30 minutes', brandColor: '#1A73E8', bannerImage: cloudBanner, icon: 'table_chart' }) },
  { id: 'cont-3', submoduleId: 'submod-2', moduleId: 'mod-1', courseId: 'course-1', name: 'Provisioning VM Instances with Startup Scripts', contentType: 'Notes', description: 'Code snippets and bash scripts to initialize VMs automatically.', fileName: 'vm_startup_scripts.txt', fileSize: '12 KB', fileUrl: '#', status: 'Draft', position: 1, ...metadata('Provisioning VM Instances with Startup Scripts', { level: 'Intermediate', estimatedDuration: '50 minutes', brandColor: '#34A853', bannerImage: cloudBanner, icon: 'notes' }) },
  { id: 'cont-4', submoduleId: 'submod-3', moduleId: 'mod-2', courseId: 'course-1', name: 'Deploying your First GKE Workload', contentType: 'Video', description: 'Step-by-step video demonstration of deployment configuration.', fileName: 'gke_first_deployment.mp4', fileSize: '45.8 MB', fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', status: 'Active', position: 1, ...metadata('Deploying your First GKE Workload', { level: 'Advanced', estimatedDuration: '1.5 hours', brandColor: '#326CE5', bannerImage: cloudBanner, icon: 'play_circle' }) },
  { id: 'cont-5', submoduleId: 'submod-5', moduleId: 'mod-4', courseId: 'course-2', name: 'Server Components vs Client Components PPT', contentType: 'PPT', description: 'Presentation slides explaining rendering life cycle.', fileName: 'rsc_vs_client_components.pptx', fileSize: '18.4 MB', fileUrl: '#', status: 'Pending', position: 1, ...metadata('Server Components vs Client Components PPT', { level: 'Advanced', estimatedDuration: '40 minutes', brandColor: '#0EA5E9', bannerImage: reactBanner, icon: 'slideshow' }) },
];

const defaultRecentActivities = [
  { id: 'act-1', text: 'Category "Cloud & Infrastructure" was updated.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'info' },
  { id: 'act-2', text: 'New Course "Advanced React & Architecture Patterns" was created.', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'success' },
  { id: 'act-3', text: 'Content file "gcp_vpc_design_patterns.pdf" was uploaded.', timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), type: 'success' },
  { id: 'act-4', text: 'Module "Module 3: GCP Databases & Storage Systems" was created.', timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), type: 'info' },
];

const ensureMetadata = (item, fallback = {}) => ({
  ...metadata(item.name || fallback.name || 'Learning item'),
  ...fallback,
  ...item,
  slug: item.slug || fallback.slug || slugify(item.name || fallback.name || 'learning-item'),
  level: item.level || fallback.level || 'Beginner',
  language: item.language || fallback.language || 'English',
  estimatedDuration: item.estimatedDuration || fallback.estimatedDuration || '1 hour',
  brandColor: item.brandColor || fallback.brandColor || DEFAULT_BRAND_COLOR,
  bannerImage: item.bannerImage || item.thumbnail || fallback.bannerImage || fallback.thumbnail || DEFAULT_BANNER_IMAGE,
  icon: item.icon || fallback.icon || 'menu_book',
});

const ensureTable = (tableName, defaults) => {
  const key = `lms_${tableName}`;
  const current = localStorage.getItem(key);

  if (!current) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return;
  }

  try {
    const parsed = JSON.parse(current);
    const migrated = parsed.map((item) => ensureMetadata(item, defaults.find((defaultItem) => defaultItem.id === item.id) || {}));
    localStorage.setItem(key, JSON.stringify(migrated));
  } catch {
    localStorage.setItem(key, JSON.stringify(defaults));
  }
};

export const initDB = () => {
  ensureTable('categories', defaultCategories);
  ensureTable('courses', defaultCourses);
  ensureTable('modules', defaultModules);
  ensureTable('submodules', defaultSubmodules);
  ensureTable('contents', defaultContents);

  if (!localStorage.getItem('lms_recent_activities')) {
    localStorage.setItem('lms_recent_activities', JSON.stringify(defaultRecentActivities));
  }
};

export const getDBTable = (tableName) => {
  initDB();
  const data = localStorage.getItem(`lms_${tableName}`);
  return data ? JSON.parse(data) : [];
};

export const saveDBTable = (tableName, data) => {
  localStorage.setItem(`lms_${tableName}`, JSON.stringify(data));
};

export const addRecentActivity = (text, type = 'info') => {
  const activities = getDBTable('recent_activities');
  const newActivity = {
    id: `act-${Date.now()}`,
    text,
    timestamp: new Date().toISOString(),
    type,
  };
  activities.unshift(newActivity);
  saveDBTable('recent_activities', activities.slice(0, 50));
};
