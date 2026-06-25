import { getDBTable, saveDBTable, addRecentActivity } from '../utils/dbInit';
import { delay, generateId } from './api';
import { buildLmsMetadata, withLmsMetadata } from '../utils/lmsMetadata';

const enrichSubmodule = (sub, modules) => ({
  ...withLmsMetadata(sub, sub.name),
  moduleName: modules.find((m) => m.id === sub.moduleId)?.name || 'Unknown Module',
});

export const submoduleService = {
  async getAll() {
    await delay();
    const submodules = getDBTable('submodules');
    const modules = getDBTable('modules');
    return submodules.map((sub) => enrichSubmodule(sub, modules)).sort((a, b) => a.position - b.position);
  },

  async getByModuleId(moduleId) {
    await delay();
    const submodules = getDBTable('submodules');
    const modules = getDBTable('modules');
    return submodules
      .filter((s) => s.moduleId === moduleId)
      .map((sub) => enrichSubmodule(sub, modules))
      .sort((a, b) => a.position - b.position);
  },

  async getById(id) {
    await delay();
    const submodules = getDBTable('submodules');
    const modules = getDBTable('modules');
    const sub = submodules.find((s) => s.id === id);
    if (!sub) throw new Error('Submodule not found');
    return enrichSubmodule(sub, modules);
  },

  async create(data) {
    await delay();
    const submodules = getDBTable('submodules');
    const modules = getDBTable('modules');
    const moduleExists = modules.some((m) => m.id === data.moduleId);
    if (!moduleExists) throw new Error('Selected Module does not exist.');

    const moduleSubmodules = submodules.filter((s) => s.moduleId === data.moduleId);
    const nextPosition = moduleSubmodules.length > 0
      ? Math.max(...moduleSubmodules.map((s) => s.position)) + 1
      : 1;

    const newSubmodule = {
      id: generateId('submod'),
      moduleId: data.moduleId,
      name: data.name,
      description: data.description || '',
      position: nextPosition,
      ...buildLmsMetadata(data, data.name),
    };

    submodules.push(newSubmodule);
    saveDBTable('submodules', submodules);
    addRecentActivity(`Submodule "${newSubmodule.name}" was created.`, 'success');
    return newSubmodule;
  },

  async update(id, data) {
    await delay();
    const submodules = getDBTable('submodules');
    const index = submodules.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Submodule not found');

    const modules = getDBTable('modules');
    const moduleExists = modules.some((m) => m.id === data.moduleId);
    if (!moduleExists) throw new Error('Selected Module does not exist.');

    const updatedSubmodule = {
      ...submodules[index],
      moduleId: data.moduleId,
      name: data.name,
      description: data.description || '',
      ...buildLmsMetadata(data, data.name),
    };

    submodules[index] = updatedSubmodule;
    saveDBTable('submodules', submodules);
    addRecentActivity(`Submodule "${updatedSubmodule.name}" was updated.`, 'info');
    return updatedSubmodule;
  },

  async delete(id) {
    await delay();
    const submodules = getDBTable('submodules');
    const sub = submodules.find((s) => s.id === id);
    if (!sub) throw new Error('Submodule not found');

    const contents = getDBTable('contents');
    const hasContents = contents.some((c) => c.submoduleId === id);
    if (hasContents) {
      throw new Error('Cannot delete submodule. It contains content items. Please delete contents first.');
    }

    const filtered = submodules.filter((s) => s.id !== id);
    const moduleSubmodules = filtered.filter((s) => s.moduleId === sub.moduleId)
      .sort((a, b) => a.position - b.position)
      .map((s, idx) => ({ ...s, position: idx + 1 }));

    const finalSubmodules = [
      ...filtered.filter((s) => s.moduleId !== sub.moduleId),
      ...moduleSubmodules,
    ];

    saveDBTable('submodules', finalSubmodules);
    addRecentActivity(`Submodule "${sub.name}" was deleted.`, 'warning');
    return { success: true, id };
  },

  async updatePositions(input) {
    await delay(300);
    const submodules = getDBTable('submodules');
    const orderedIds = Array.isArray(input) ? input : input?.orderedIds || [];
    const moduleId = Array.isArray(input) ? undefined : input?.moduleId;

    const scopedSubmodules = moduleId
      ? submodules.filter((submodule) => submodule.moduleId === moduleId)
      : submodules;

    orderedIds.forEach((id, index) => {
      const sub = scopedSubmodules.find((submodule) => submodule.id === id);
      if (sub) {
        sub.position = index + 1;
      }
    });

    saveDBTable('submodules', submodules);
    addRecentActivity('Submodules were reordered.', 'info');
    return submodules.map((sub) => withLmsMetadata(sub, sub.name));
  },
};
