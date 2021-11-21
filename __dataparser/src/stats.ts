const reports = require('../data-out/patients.json');

const results = {
    kd: { SAnegative: 0, SApositive: 0 },
    kvin: { SAnegative: 0, SApositive: 0 },
    khia: { SAnegative: 0, SApositive: 0 },
    total: { SAnegative: 0, SApositive: 0 },
};

for (const report of reports) {
    if (!report.clinic) {
        console.log('No clinic!!!', report.id);
        continue;
    }
    if (report.discharge_as === 1) {
        results[report.clinic].SApositive += 1;
        results.total.SApositive += 1;
    } else {
        results[report.clinic].SAnegative += 1;
        results.total.SAnegative += 1;
    }
}

console.log(results);
