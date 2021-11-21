import { Patient } from "./types";

interface Result {
  SApositive: number;
  SAnegative: number;
}

interface Results {
  kd: Result;
  kvin: Result;
  khia: Result;
  total: Result;
}

const input: Patient[] = require("./patients.json");

const results: Results = {
  kd: { SAnegative: 0, SApositive: 0 },
  kvin: { SAnegative: 0, SApositive: 0 },
  khia: { SAnegative: 0, SApositive: 0 },
  total: { SAnegative: 0, SApositive: 0 },
};

for (const report of input) {
  if (report.discharge_as === 1) {
    results[report.clinic].SApositive += 1;
    results.total.SApositive += 1;
  } else {
    results[report.clinic].SAnegative += 1;
    results.total.SAnegative += 1;
  }
}
///

console.log(results);

const randomSort = (input: any[]) => {
  const randomObj = {};

  for (const item of input) {
    let key = null;
    while (randomObj[key]) {
      key = Math.round(Math.random() * 10000);
    }
    randomObj[key] = item;
  }

  return Object.values(randomObj);
};
// console.log([11, 2, 22, 1].sort((a, b) => a - b));

let kd = randomSort(input.filter((patient) => patient.clinic === "kd"));
const kdT = kd.slice(0, Math.round(kd.length * 0.8));
const kdV = kd.slice(Math.round(kd.length * 0.8));
let kvin = randomSort(input.filter((patient) => patient.clinic === "kvin"));
const kvinT = kvin.slice(0, Math.round(kvin.length * 0.8));
const kvinV = kvin.slice(Math.round(kvin.length * 0.8));
let khia = randomSort(input.filter((patient) => patient.clinic === "khia"));
const khiaT = khia.slice(0, Math.round(khia.length * 0.8));
const khiaV = khia.slice(Math.round(khia.length * 0.8));

console.log(kdT.length);
console.log(kdV.length);
console.log(kvinT.length);
console.log(kvinV.length);
console.log(khiaT.length);
console.log(khiaV.length);

const trainingDataset = kdT.concat(kvinT, khiaT);
const validDataset = kdV.concat(kvinV, khiaV);

import fs from "fs/promises";
fs.writeFile("trainingDataset.json", JSON.stringify(trainingDataset));
fs.writeFile("validDataset.json", JSON.stringify(validDataset));
