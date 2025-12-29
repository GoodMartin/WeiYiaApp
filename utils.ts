import { Employee } from './types';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Simple CSV Parser
export const parseCSV = (content: string): Partial<Employee>[] => {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Assume first row is header
  // Headers expected: staffId, name, department, title, gender
  // We will map by index roughly if headers don't match exactly, or try to find columns
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const dataLines = lines.slice(1);

  const employees: Partial<Employee>[] = dataLines.map(line => {
    // Handle quotes in CSV if necessary, simplest split for now
    // A robust regex split for CSV: 
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/,/g, '').trim()); // simple cleanup

    const emp: any = {};
    
    // Simple mapping based on expected position if headers are missing, or index lookup
    const staffIdIdx = headers.findIndex(h => h.includes('工號') || h.includes('id'));
    const nameIdx = headers.findIndex(h => h.includes('姓名') || h.includes('name'));
    const deptIdx = headers.findIndex(h => h.includes('部門') || h.includes('dept'));
    const titleIdx = headers.findIndex(h => h.includes('職稱') || h.includes('title'));
    const genderIdx = headers.findIndex(h => h.includes('性別') || h.includes('gender'));

    emp.staffId = staffIdIdx > -1 ? cleanValues[staffIdIdx] : cleanValues[0] || 'Unknown';
    emp.name = nameIdx > -1 ? cleanValues[nameIdx] : cleanValues[1] || 'Unknown';
    emp.department = deptIdx > -1 ? cleanValues[deptIdx] : cleanValues[2] || 'General';
    emp.title = titleIdx > -1 ? cleanValues[titleIdx] : cleanValues[3] || 'Staff';
    emp.gender = genderIdx > -1 ? cleanValues[genderIdx] : cleanValues[4] || '';

    return emp;
  });

  return employees.filter(e => e.name && e.name !== 'Unknown');
};

export const downloadCSV = (filename: string, csvContent: string) => {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
