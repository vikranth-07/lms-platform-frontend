import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';

import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';

import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import Roles from '../pages/Roles';

import CategoryList from '../pages/Category/CategoryList';
import CategoryForm from '../pages/Category/CategoryForm';

import CourseList from '../pages/Course/CourseList';
import CourseForm from '../pages/Course/CourseForm';
import CourseView from '../pages/Course/CourseView';

import ContentList from '../pages/Content/ContentList';
import ContentForm from '../pages/Content/ContentForm';
import ContentPreview from '../pages/Content/ContentPreview';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/category" element={<CategoryList />} />
        <Route path="/category/add" element={<CategoryForm />} />
        <Route path="/category/edit/:id" element={<CategoryForm />} />

        <Route path="/course" element={<CourseList />} />
        <Route path="/course/add" element={<CourseForm />} />
        <Route path="/course/edit/:id" element={<CourseForm />} />
        <Route path="/course/view/:id" element={<CourseView />} />

        <Route path="/content" element={<ContentList />} />
        <Route path="/content/add" element={<ContentForm />} />
        <Route path="/content/edit/:id" element={<ContentForm />} />
        <Route path="/content/preview/:id" element={<ContentPreview />} />

        <Route path="/users" element={<Users />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
