export type NBool = 0 | 1;

export interface ReportBlock {
    title: string;
    body: string;
}

export interface Patient {
    id: string; // czech birth number
    clinic: string;
    admission_age: number; // age on day of admission report
    sex: 'M' | 'F';
    admission: ReportBlock[];
    discharge: ReportBlock[];
    discharge_as: NBool;
    features: any; // { male: Nbool, female: NBool, admission_age_X: NBool }
}

export interface Output {
    patients: Patient[];
}
