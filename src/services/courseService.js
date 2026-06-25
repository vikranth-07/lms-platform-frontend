import { getDBTable, saveDBTable, addRecentActivity } from '../utils/dbInit';
import { delay, generateId } from './api';
import { buildLmsMetadata, withLmsMetadata, DEFAULT_BANNER_IMAGE } from '../utils/lmsMetadata';

const enrichCourse = (course, categories) => ({
  ...withLmsMetadata(course, course.name),
  categoryName: categories.find((cat) => cat.id === course.categoryId)?.name || 'Unknown Category',
});

export const courseService = {
  async getAll() {
    await delay();
    const courses = getDBTable('courses');
    const categories = getDBTable('categories');
    return courses.map((course) => enrichCourse(course, categories));
  },

  async getById(id) {
    await delay();
    const courses = getDBTable('courses');
    const categories = getDBTable('categories');
    const course = courses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');
    return enrichCourse(course, categories);
  },

  async create(data) {
    await delay();
    const courses = getDBTable('courses');
    const categories = getDBTable('categories');
    const categoryExists = categories.some((cat) => cat.id === data.categoryId);
    if (!categoryExists) throw new Error('Selected Category does not exist.');

    if (courses.some((c) => c.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error('A course with this name already exists.');
    }

    const metadata = buildLmsMetadata(data, data.name);
    const newCourse = {
      id: generateId('course'),
      categoryId: data.categoryId,
      name: data.name,
      description: data.description || '',
      thumbnail: data.thumbnail || data.bannerImage || DEFAULT_BANNER_IMAGE,
      status: data.status || 'Active',
      ...metadata,
    };

    courses.push(newCourse);
    saveDBTable('courses', courses);
    addRecentActivity(`Course "${newCourse.name}" was created.`, 'success');
    return newCourse;
  },

  async update(id, data) {
    await delay();
    const courses = getDBTable('courses');
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Course not found');

    const categories = getDBTable('categories');
    const categoryExists = categories.some((cat) => cat.id === data.categoryId);
    if (!categoryExists) throw new Error('Selected Category does not exist.');

    if (courses.some((c) => c.id !== id && c.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error('Another course with this name already exists.');
    }

    const metadata = buildLmsMetadata(data, data.name);
    const updatedCourse = {
      ...courses[index],
      categoryId: data.categoryId,
      name: data.name,
      description: data.description || '',
      thumbnail: data.thumbnail || data.bannerImage || courses[index].thumbnail,
      status: data.status || 'Active',
      ...metadata,
    };

    courses[index] = updatedCourse;
    saveDBTable('courses', courses);
    addRecentActivity(`Course "${updatedCourse.name}" was updated.`, 'info');
    return updatedCourse;
  },

  async delete(id) {
    await delay();
    const courses = getDBTable('courses');
    const course = courses.find((c) => c.id === id);
    if (!course) throw new Error('Course not found');

    const modules = getDBTable('modules');
    const hasModules = modules.some((m) => m.courseId === id);
    if (hasModules) {
      throw new Error('Cannot delete course. It contains active modules. Please delete or reassign modules first.');
    }

    const filtered = courses.filter((c) => c.id !== id);
    saveDBTable('courses', filtered);
    addRecentActivity(`Course "${course.name}" was deleted.`, 'warning');
    return { success: true, id };
  },
};
