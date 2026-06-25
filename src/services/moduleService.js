import { getDBTable, saveDBTable, addRecentActivity } from '../utils/dbInit';
import { delay, generateId } from './api';
import { buildLmsMetadata, withLmsMetadata } from '../utils/lmsMetadata';

const enrichModule = (mod, courses) => ({
  ...withLmsMetadata(mod, mod.name),
  courseName: courses.find((c) => c.id === mod.courseId)?.name || 'Unknown Course',
});

export const moduleService = {
  async getAll() {
    await delay();
    const modules = getDBTable('modules');
    const courses = getDBTable('courses');
    return modules.map((mod) => enrichModule(mod, courses)).sort((a, b) => a.position - b.position);
  },

  async getByCourseId(courseId) {
    await delay();
    const modules = getDBTable('modules');
    const courses = getDBTable('courses');
    return modules
      .filter((m) => m.courseId === courseId)
      .map((mod) => enrichModule(mod, courses))
      .sort((a, b) => a.position - b.position);
  },

  async getById(id) {
    await delay();
    const modules = getDBTable('modules');
    const courses = getDBTable('courses');
    const mod = modules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');
    return enrichModule(mod, courses);
  },

  async create(data) {
    await delay();
    const modules = getDBTable('modules');
    const courses = getDBTable('courses');
    const courseExists = courses.some((c) => c.id === data.courseId);
    if (!courseExists) throw new Error('Selected Course does not exist.');

    const courseModules = modules.filter((m) => m.courseId === data.courseId);
    const nextPosition = courseModules.length > 0
      ? Math.max(...courseModules.map((m) => m.position)) + 1
      : 1;

    const newModule = {
      id: generateId('mod'),
      courseId: data.courseId,
      name: data.name,
      description: data.description || '',
      position: nextPosition,
      ...buildLmsMetadata(data, data.name),
    };

    modules.push(newModule);
    saveDBTable('modules', modules);
    addRecentActivity(`Module "${newModule.name}" was created.`, 'success');
    return newModule;
  },

  async update(id, data) {
    await delay();
    const modules = getDBTable('modules');
    const index = modules.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Module not found');

    const courses = getDBTable('courses');
    const courseExists = courses.some((c) => c.id === data.courseId);
    if (!courseExists) throw new Error('Selected Course does not exist.');

    const updatedModule = {
      ...modules[index],
      courseId: data.courseId,
      name: data.name,
      description: data.description || '',
      ...buildLmsMetadata(data, data.name),
    };

    modules[index] = updatedModule;
    saveDBTable('modules', modules);
    addRecentActivity(`Module "${updatedModule.name}" was updated.`, 'info');
    return updatedModule;
  },

  async delete(id) {
    await delay();
    const modules = getDBTable('modules');
    const mod = modules.find((m) => m.id === id);
    if (!mod) throw new Error('Module not found');

    const submodules = getDBTable('submodules');
    const hasSubmodules = submodules.some((s) => s.moduleId === id);
    if (hasSubmodules) {
      throw new Error('Cannot delete module. It contains submodules. Please delete or reassign submodules first.');
    }

    const filtered = modules.filter((m) => m.id !== id);
    const courseModules = filtered.filter((m) => m.courseId === mod.courseId)
      .sort((a, b) => a.position - b.position)
      .map((m, idx) => ({ ...m, position: idx + 1 }));

    const finalModules = [
      ...filtered.filter((m) => m.courseId !== mod.courseId),
      ...courseModules,
    ];

    saveDBTable('modules', finalModules);
    addRecentActivity(`Module "${mod.name}" was deleted.`, 'warning');
    return { success: true, id };
  },

  async updatePositions(input) {
    await delay(300);
    const modules = getDBTable('modules');
    const orderedIds = Array.isArray(input) ? input : input?.orderedIds || [];
    const courseId = Array.isArray(input) ? undefined : input?.courseId;

    const scopedModules = courseId
      ? modules.filter((module) => module.courseId === courseId)
      : modules;

    orderedIds.forEach((id, index) => {
      const mod = scopedModules.find((module) => module.id === id);
      if (mod) {
        mod.position = index + 1;
      }
    });

    saveDBTable('modules', modules);
    addRecentActivity('Modules were reordered.', 'info');
    return modules.map((mod) => withLmsMetadata(mod, mod.name));
  },
};
