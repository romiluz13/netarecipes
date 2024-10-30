import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import RecipeForm from '../components/RecipeForm';
import RecipeDetail from '../components/RecipeDetail';

function Recipes() {
  return (
    <Routes>
      <Route path="/" element={<RecipeList />} />
      <Route path="/new" element={<RecipeForm />} />
      <Route path="/:id" element={<RecipeDetail />} />
      <Route path="/:id/edit" element={<RecipeForm />} />
    </Routes>
  );
}

export default Recipes;