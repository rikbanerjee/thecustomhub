const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../docs/amazon/DRINKING_CUP.xlsm');

try {
    const workbook = XLSX.readFile(templatePath);
    console.log('Sheet Names:', workbook.SheetNames);

    // Usually the data sheet is "Template"
    const templateSheetName = workbook.SheetNames.find(name => name === 'Template');
    if (templateSheetName) {
        const worksheet = workbook.Sheets[templateSheetName];
        
        // Get range
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log(`
Sheet "${templateSheetName}" Range: ${worksheet['!ref']}`);

        console.log('\n--- Row 0 (Index 0) ---');
        const row0 = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({r: 0, c: C})];
            if (cell) row0.push(cell.v);
        }
        console.log(JSON.stringify(row0));

        console.log('\n--- Row 1 (Index 1) ---');
        const row1 = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
             const cell = worksheet[XLSX.utils.encode_cell({r: 1, c: C})];
             if (cell) row1.push(cell.v);
        }
        console.log(JSON.stringify(row1).substring(0, 200) + '...'); // Truncate

         console.log('\n--- Row 2 (Index 2) ---');
        const row2 = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
             const cell = worksheet[XLSX.utils.encode_cell({r: 2, c: C})];
             if (cell) row2.push(cell.v);
        }
        console.log(JSON.stringify(row2).substring(0, 200) + '...'); 
        
        console.log('\n--- Row 3 (Index 3) ---'); // Often technical headers in some templates, or data definitions
        const row3 = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
             const cell = worksheet[XLSX.utils.encode_cell({r: 3, c: C})];
             if (cell) row3.push(cell.v);
        }
        console.log(JSON.stringify(row3));

        console.log('\n--- Row 4 (Index 4) ---'); // Often technical headers
        const row4 = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
             const cell = worksheet[XLSX.utils.encode_cell({r: 4, c: C})];
             if (cell) row4.push(cell.v);
        }
        console.log(JSON.stringify(row4));

    } else {
        console.log('Template sheet not found. Available sheets:', workbook.SheetNames);
    }

} catch (error) {
    console.error('Error reading template:', error);
}
