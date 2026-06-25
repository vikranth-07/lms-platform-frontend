import { getDBTable, saveDBTable, addRecentActivity } from '../utils/dbInit';
import { delay, generateId } from './api';
import { buildLmsMetadata, withLmsMetadata } from '../utils/lmsMetadata';

const enrichContent = (content, courses, modules, submodules, index = 0) => ({
  ...withLmsMetadata(content, content.name),
  courseName: courses.find((course) => course.id === content.courseId)?.name || 'Unknown Course',
  moduleName: modules.find((m) => m.id === content.moduleId)?.name || 'Unknown Module',
  submoduleName: submodules.find((s) => s.id === content.submoduleId)?.name || 'Unknown Submodule',
  position: content.position || index + 1,
});

export const contentService = {
  async getAll() {
    await delay();
    const contents = getDBTable('contents');
    const courses = getDBTable('courses');
    const modules = getDBTable('modules');
    const submodules = getDBTable('submodules');
    return contents.map((content, index) => enrichContent(content, courses, modules, submodules, index)).sort((a, b) => a.position - b.position);
  },

  async getBySubmoduleId(submoduleId) {
    await delay();
    const contents = getDBTable('contents');
    const courses = getDBTable('courses');
    const modules = getDBTable('modules');
    const submodules = getDBTable('submodules');
    return contents
      .filter((c) => c.submoduleId === submoduleId)
      .map((content, index) => enrichContent(content, courses, modules, submodules, index))
      .sort((a, b) => a.position - b.position);
  },

  async getById(id) {
    await delay();
    const contents = getDBTable('contents');
    const courses = getDBTable('courses');
    const modules = getDBTable('modules');
    const submodules = getDBTable('submodules');
    const content = contents.find((item) => item.id === id);
    if (!content) throw new Error('Content not found');
    return enrichContent(content, courses, modules, submodules, 0);
  },

  async create(data) {
    await delay();
    const contents = getDBTable('contents');
    const courses = getDBTable('courses');
    const modules = getDBTable('modules');
    const submodules = getDBTable('submodules');

    if (!courses.some((c) => c.id === data.courseId)) throw new Error('Selected Course does not exist.');
    if (!modules.some((m) => m.id === data.moduleId)) throw new Error('Selected Module does not exist.');
    if (!submodules.some((s) => s.id === data.submoduleId)) throw new Error('Selected Submodule does not exist.');

    const subContents = contents.filter((c) => c.submoduleId === data.submoduleId);
    const nextPosition = subContents.length > 0
      ? Math.max(...subContents.map((c) => c.position || 0)) + 1
      : 1;

    const newContent = {
      id: generateId('cont'),
      courseId: data.courseId,
      moduleId: data.moduleId,
      submoduleId: data.submoduleId,
      name: data.name,
      contentType: data.contentType,
      description: data.description || '',
      fileName: data.fileName || '',
      fileSize: data.fileSize || '',
      fileUrl: data.fileUrl || '#',
      status: data.status || 'Active',
      position: nextPosition,
      ...buildLmsMetadata(data, data.name),
    };

    contents.push(newContent);
    saveDBTable('contents', contents);
    addRecentActivity(`Content "${newContent.name}" was uploaded.`, 'success');
    return newContent;
  },

  async update(id, data) {
    await delay();
    const contents = getDBTable('contents');
    const index = contents.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Content not found');

    const courses = getDBTable('courses');
    const modules = getDBTable('modules');
    const submodules = getDBTable('submodules');

    if (!courses.some((c) => c.id === data.courseId)) throw new Error('Selected Course does not exist.');
    if (!modules.some((m) => m.id === data.moduleId)) throw new Error('Selected Module does not exist.');
    if (!submodules.some((s) => s.id === data.submoduleId)) throw new Error('Selected Submodule does not exist.');

    const updatedContent = {
      ...contents[index],
      courseId: data.courseId,
      moduleId: data.moduleId,
      submoduleId: data.submoduleId,
      name: data.name,
      contentType: data.contentType,
      description: data.description || '',
      fileName: data.fileName || contents[index].fileName,
      fileSize: data.fileSize || contents[index].fileSize,
      fileUrl: data.fileUrl || contents[index].fileUrl,
      status: data.status || 'Active',
      ...buildLmsMetadata(data, data.name),
    };

    contents[index] = updatedContent;
    saveDBTable('contents', contents);
    addRecentActivity(`Content "${updatedContent.name}" was updated.`, 'info');
    return updatedContent;
  },

  async delete(id) {
    await delay();
    const contents = getDBTable('contents');
    const content = contents.find((c) => c.id === id);
    if (!content) throw new Error('Content not found');

    const filtered = contents.filter((c) => c.id !== id);
    const subContents = filtered.filter((c) => c.submoduleId === content.submoduleId)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((c, idx) => ({ ...c, position: idx + 1 }));

    const finalContents = [
      ...filtered.filter((c) => c.submoduleId !== content.submoduleId),
      ...subContents,
    ];

    saveDBTable('contents', finalContents);
    addRecentActivity(`Content "${content.name}" was deleted.`, 'warning');
    return { success: true, id };
  },

  async updatePositions(input) {
    await delay(300);
    const contents = getDBTable('contents');
    const orderedIds = Array.isArray(input) ? input : input?.orderedIds || [];
    const submoduleId = Array.isArray(input) ? undefined : input?.submoduleId;

    const scopedContents = submoduleId
      ? contents.filter((content) => content.submoduleId === submoduleId)
      : contents;

    orderedIds.forEach((id, index) => {
      const content = scopedContents.find((item) => item.id === id);
      if (content) {
        content.position = index + 1;
      }
    });

    saveDBTable('contents', contents);
    addRecentActivity('Content items were reordered.', 'info');
    return contents.map((content) => withLmsMetadata(content, content.name));
  },

  async mockUploadFile(file, onProgress) {
    const allowedExtensions = ['pdf', 'ppt', 'pptx', 'docx', 'mp4', 'png', 'jpg', 'jpeg'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new Error(`Unsupported file type: .${extension}. Only PDF, PPT, DOCX, MP4, and Images are allowed.`);
    }

    const maxBytes = 100 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('File is too large. Maximum allowed size is 100MB.');
    }

    for (let progress = 10; progress <= 100; progress += 15) {
      await delay(150);
      if (onProgress) {
        onProgress(Math.min(progress, 100));
      }
    }

    const fileSizeString = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    return {
      fileName: file.name,
      fileSize: fileSizeString,
      fileUrl: extension === 'mp4' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : '#',
    };
  },
};
