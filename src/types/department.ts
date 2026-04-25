export interface Department {
  deptCode: string;     // VARCHAR(3) PK (e.g., ACT, BR1, HRD, IT)
  deptName: string;
  record_status: 'ACTIVE' | 'INACTIVE';
  stamp: string | null;
}

export interface CreateDepartmentData {
  deptCode: string;
  deptName: string;
}

export interface UpdateDepartmentData {
  deptName?: string;
}
