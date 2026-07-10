import { useState, useEffect } from 'react';
import apiRequest from '../api/apiHelper';

// Fetches the curriculum structure (classes, streams, subgroups, subjects)
// from the backend, used to build the cascading dropdowns on the student
// add/edit form. This mirrors utils/curriculum.js on the backend.
export function useCurriculum(token) {
  const [curriculum, setCurriculum] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest('/curriculum', { token });
        setCurriculum(data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (token) load();
  }, [token]);

  return { curriculum, error };
}

// Given the curriculum data and a class number, returns the available streams
// e.g. classNumber 9 or 10 -> { science: {...}, tech: {...} } (Matric)
//      classNumber 11 or 12 -> { fsc: {...}, ics: {...} } (Intermediate)
export function getStreamsForClass(curriculum, classNumber) {
  if (!curriculum) return {};
  if (classNumber === 9 || classNumber === 10) {
    return curriculum.matric.streams;
  }
  if (classNumber === 11 || classNumber === 12) {
    return curriculum.intermediate.groups;
  }
  return {};
}
