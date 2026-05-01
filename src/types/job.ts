export interface Job {
  jobCode: string;      // VARCHAR(4) PK (e.g., PRES, VP, MGR, SA1)
  jobDesc: string;
  record_status: 'ACTIVE' | 'INACTIVE';
  stamp: string | null;
}

export interface CreateJobData {
  jobCode: string;
  jobDesc: string;
}

export interface UpdateJobData {
  jobDesc?: string;
}
