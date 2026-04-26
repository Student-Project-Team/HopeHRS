export interface JobHistoryEntry {
  empNo: string;
  jobCode: string;
  effDate: string;
  salary: number;
  deptCode: string;
  record_status: 'ACTIVE' | 'INACTIVE';
  stamp: string | null;
}

export interface JobHistoryWithDetails extends JobHistoryEntry {
  jobDesc: string;
  deptName: string;
}

export interface CreateJobHistoryData {
  empNo: string;
  jobCode: string;
  effDate: string;
  salary: number;
  deptCode: string;
}

export interface UpdateJobHistoryData {
  jobCode?: string;
  effDate?: string;
  salary?: number;
  deptCode?: string;
}
