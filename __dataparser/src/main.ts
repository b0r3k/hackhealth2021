import fsSync from 'fs';
import fs from 'fs/promises';
import parse from 'node-html-parser';
import path from 'path';
import { rodnecislo } from 'rodnecislo';

import type { Patient } from './types';

const RC_REGEX = /[0-9]{2,10}\/\d+/;

const AGE_FEATURES = (() => {
    const features = {};

    for (let i = 0; i < 110; i++) {
        features[`admission_age_${i}`] = 0;
    }

    return features;
})();

async function main() {
    let total = 0;
    let admissions = 0;
    let discharges = 0;
    let skipped = 0;

    const clinics = ['kd', 'kvin', 'khia'];

    const patients = new Map<string, Partial<Patient>>();

    for (const clinic of clinics) {
        console.log(`Processing ${clinic}`);

        const filenames = fsSync.readdirSync(path.resolve(__dirname, '..', 'data', clinic));

        for (const filename of filenames) {
            // console.log(`Processing ${clinic}/${filename}`);

            // construct Patient object
            const patient: Partial<Patient> = {};

            const fnl = filename.toLowerCase();

            // skip files that aren't HTML
            if (!fnl.endsWith('.html')) {
                continue;
            }

            // read and parse HTML
            const documentText = await fs.readFile(
                path.resolve(__dirname, '..', 'data', clinic, filename),
                'utf-8',
            );

            const parsedDocument = parse(documentText);

            // process report blocks
            const reportBlocks = parsedDocument.querySelectorAll('.report_block');

            const blocks = [];

            for (const reportBlock of reportBlocks) {
                const title = reportBlock
                    .querySelector('.report_subtitle')
                    ?.text.replace(/\s+/g, ' ')
                    .trim();

                const body = reportBlock
                    .querySelector('.report_textblock')
                    ?.text.replace(/\s+/g, ' ')
                    .trim();

                blocks.push({ title, body });
            }

            const nameBox = parsedDocument.querySelector('.marginbox_topleft').text;
            const rc = RC_REGEX.exec(nameBox);

            if (!rc) {
                skipped += 1;
                console.log(
                    `Skipping ${clinic}/${filename} because it has invalid RC - ${nameBox}`,
                );
                continue;
            }

            patient.id = rc[0];

            total += 1;

            patient.clinic = clinic;

            const rcislo = rodnecislo(patient.id);
            patient.sex = rcislo.isMale() ? 'M' : 'F';

            if (fnl.startsWith('ar')) {
                // admission report
                admissions += 1;
                patient.admission = blocks;
                patient.admission_age = rcislo.age();
                patient.sex = rcislo.isMale() ? 'M' : 'F';
                patient.features = {
                    male: rcislo.isMale(),
                    female: rcislo.isFemale(),
                    ...AGE_FEATURES,
                    [`admission_age_${patient.admission_age}`]: 1,
                };
            } else if (fnl.startsWith('dr')) {
                // discharge report
                discharges += 1;
                patient.discharge = blocks;
                patient.discharge_as = documentText.includes('I35') ? 1 : 0;
            } else {
                continue;
            }

            // save to patients map
            if (!patients.has(patient.id)) {
                patients.set(patient.id, patient);
            } else {
                const existing = patients.get(patient.id);
                patients.set(patient.id, {
                    ...existing,
                    ...patient,
                });
            }
        }
    }

    console.log('\nStats', {
        total,
        discharges,
        admissions,
        skipped,
    });

    console.log('\nWriting output...');
    await fs.writeFile('data-out/patients.json', JSON.stringify(Array.from(patients.values())));
}

main();
