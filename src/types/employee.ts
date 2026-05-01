export interface Employee {
empno: string; // VARCHAR(5) PK
lastname: string;
firstname: string;
gender: 'M' | 'F';
birthdate: string;
hiredate: string;
sepDate: string | null;
record_status: 'ACTIVE' | 'INACTIVE';
stamp: string | null;
}
export interface CreateEmployeeData {
empno: string;
lastname: string;
firstname: string;
gender: 'M' | 'F';
birthdate: string;
hiredate: string;
sepDate?: string | null;
}
export interface UpdateEmployeeData {
lastname?: string;
firstname?: string;
gender?: 'M' | 'F';
birthdate?: string;
hiredate?: string;
sepDate?: string | null;
}