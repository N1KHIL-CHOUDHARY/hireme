import { getSupabaseAdmin } from '@/lib/supabase';
import { InterviewState } from './interview-state';

export interface ParsedResume {
  extractedText: string;
  about: string;
  skills: string[];
  experience: {
    years: number;
    companies: string[];
  };
  education: {
    degree: string;
    institution: string;
  }[];
  analyzedAt: Date;
  matchScore?: number;
  aiComments?: string;
  matchedAt?: Date;
  topSkillMatches?: string[];
  missingSkills?: string[];
}

export interface MonitoringImage {
  s3Key: string;
  timestamp: Date;
  signedUrl?: string;
}

export interface InterviewMessage {
  text: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: Date;
  questionId?: string;
  questionCategory?: string;
  feedback?: string;
  audioS3Key?: string;
  audioS3Bucket?: string;
  audioUrl?: string;
}

export interface IJobApplication {
  id: string;
  _id: string;
  jobId: string;
  userId: string;
  candidateName?: string;
  email?: string;
  resumeUrl: string;
  resumeBase64: string;
  fileName: string;
  s3Key?: string;
  s3Bucket?: string;
  preferredLanguage: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  parsedResume?: ParsedResume;
  interviewState?: InterviewState;
  monitoringEnabled?: boolean;
  monitoringInterval?: number;
  monitoringImages?: MonitoringImage[];
  interviewChatHistory?: InterviewMessage[];
  resume?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  interviewEvaluation?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  createdAt: Date;
  updatedAt: Date;
  toJSON(): Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  save(): Promise<IJobApplication>;
}

function formatApplication(row: any): IJobApplication { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!row) return row;
  const id = String(row.id || row._id);
  const app: IJobApplication = {
    id,
    _id: id,
    jobId: String(row.jobId || row.job_id || ''),
    userId: String(row.userId || row.user_id || ''),
    candidateName: row.candidateName || row.candidate_name || undefined,
    email: row.email || undefined,
    resumeUrl: row.resumeUrl || row.resume_url || '',
    resumeBase64: row.resumeBase64 || row.resume_base64 || '',
    fileName: row.fileName || row.file_name || '',
    s3Key: row.s3Key || row.s3_key || undefined,
    s3Bucket: row.s3Bucket || row.s3_bucket || undefined,
    preferredLanguage: row.preferredLanguage || row.preferred_language || 'en',
    status: row.status || 'pending',
    parsedResume: row.parsedResume || row.parsed_resume || undefined,
    interviewState: row.interviewState || row.interview_state || undefined,
    monitoringEnabled: row.monitoringEnabled !== undefined ? row.monitoringEnabled : false,
    monitoringInterval: Number(row.monitoringInterval || row.monitoring_interval || 30000),
    monitoringImages: Array.isArray(row.monitoringImages || row.monitoring_images)
      ? (row.monitoringImages || row.monitoring_images)
      : [],
    interviewChatHistory: Array.isArray(row.interviewChatHistory || row.interview_chat_history)
      ? (row.interviewChatHistory || row.interview_chat_history)
      : [],
    resume: row.resume || undefined,
    interviewEvaluation: row.interviewEvaluation || undefined,
    createdAt: new Date(row.createdAt || row.created_at || Date.now()),
    updatedAt: new Date(row.updatedAt || row.updated_at || Date.now()),
    toJSON: function () {
      const copy: any = { ...this }; // eslint-disable-line @typescript-eslint/no-explicit-any
      delete copy.toJSON;
      delete copy.save;
      return copy;
    },
    save: async function () {
      const supabase = getSupabaseAdmin();
      const payload: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
        status: this.status,
        parsedResume: this.parsedResume,
        interviewState: this.interviewState,
        monitoringImages: this.monitoringImages,
        interviewChatHistory: this.interviewChatHistory,
        updatedAt: new Date().toISOString(),
      };
      await supabase.from('job_applications').update(payload).eq('id', this.id);
      return this;
    },
  };
  return app;
}

class JobApplicationQuery<T = IJobApplication | IJobApplication[] | null> implements PromiseLike<T> {
  private filter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private isSingle: boolean;
  private selectedFields?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private _limit?: number;
  private _skip?: number;
  private _sort?: Record<string, number>;

  constructor(filter: any = {}, isSingle = false) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.filter = filter;
    this.isSingle = isSingle;
  }

  select(fields: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.selectedFields = fields;
    return this;
  }

  sort(sortObj: Record<string, number>) {
    this._sort = sortObj;
    return this;
  }

  skip(count: number) {
    this._skip = count;
    return this;
  }

  limit(count: number) {
    this._limit = count;
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<T> {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('job_applications').select('*');

    if (this.filter) {
      if (this.filter._id) query = query.eq('id', this.filter._id);
      if (this.filter.id) query = query.eq('id', this.filter.id);
      if (this.filter.jobId) {
        if (typeof this.filter.jobId === 'object' && this.filter.jobId.$in && Array.isArray(this.filter.jobId.$in)) {
          query = query.in('jobId', this.filter.jobId.$in);
        } else {
          query = query.eq('jobId', String(this.filter.jobId));
        }
      }
      if (this.filter.userId) {
        query = query.eq('userId', String(this.filter.userId));
      }
      if (this.filter.status) {
        query = query.eq('status', this.filter.status);
      }
      if (Array.isArray(this.filter.$or) && this.filter.$or.length > 0) {
        const orClauses: string[] = [];
        for (const item of this.filter.$or) {
          if (item.candidateName?.$regex) orClauses.push(`candidateName.ilike.%${item.candidateName.$regex}%`);
          if (item.fileName?.$regex) orClauses.push(`fileName.ilike.%${item.fileName.$regex}%`);
        }
        if (orClauses.length > 0) query = query.or(orClauses.join(','));
      }
    }

    if (this._sort) {
      for (const [key, dir] of Object.entries(this._sort)) {
        query = query.order(key, { ascending: dir === 1 });
      }
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    if (this._skip !== undefined && this._limit !== undefined) {
      query = query.range(this._skip, this._skip + this._limit - 1);
    } else if (this._limit !== undefined) {
      query = query.limit(this._limit);
    }

    if (this.isSingle) {
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) {
        console.error('Error fetching application from Supabase:', error);
        return null as unknown as T;
      }
      if (!data) return null as unknown as T;
      return formatApplication(data) as unknown as T;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching applications from Supabase:', error);
      return [] as unknown as T;
    }

    const formatted = (data || []).map((row) => formatApplication(row));
    return formatted as unknown as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<T | TResult> {
    return this.exec().catch(onrejected);
  }
}

export const JobApplication = {
  findById(id: string) {
    return new JobApplicationQuery<IJobApplication | null>({ id }, true);
  },

  findOne(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new JobApplicationQuery<IJobApplication | null>(filter, true);
  },

  find(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new JobApplicationQuery<IJobApplication[]>(filter, false);
  },

  async create(data: any): Promise<IJobApplication> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();

    const insertData = {
      jobId: String(data.jobId),
      userId: String(data.userId),
      candidateName: data.candidateName || null,
      email: data.email || null,
      resumeUrl: data.resumeUrl,
      resumeBase64: data.resumeBase64,
      fileName: data.fileName,
      s3Key: data.s3Key || null,
      s3Bucket: data.s3Bucket || null,
      preferredLanguage: data.preferredLanguage || 'en',
      status: data.status || 'pending',
      parsedResume: data.parsedResume || null,
      monitoringEnabled: data.monitoringEnabled !== undefined ? data.monitoringEnabled : false,
      monitoringInterval: data.monitoringInterval || 30000,
      monitoringImages: data.monitoringImages || [],
      interviewChatHistory: data.interviewChatHistory || [],
      interviewState: data.interviewState || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('job_applications')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating job application in Supabase:', error);
      throw new Error(`Failed to create job application: ${error.message}`);
    }

    return formatApplication(created);
  },

  async findByIdAndUpdate(
    id: string,
    update: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options: { new?: boolean } = { new: true } // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<IJobApplication | null> {
    const supabase = getSupabaseAdmin();

    let currentData: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (update.$push || update.$set) {
      const { data: current } = await supabase.from('job_applications').select('*').eq('id', id).maybeSingle();
      currentData = current;
    }

    const cleanUpdate = update.$set ? { ...update.$set } : { ...update };
    delete cleanUpdate.$push;
    delete cleanUpdate.$set;

    if (update.$push) {
      for (const [key, val] of Object.entries(update.$push)) {
        const currentList = Array.isArray(currentData?.[key]) ? currentData[key] : [];
        cleanUpdate[key] = [...currentList, val];
      }
    }

    cleanUpdate.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('job_applications')
      .update(cleanUpdate)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error updating job application in Supabase:', error);
      throw new Error(`Failed to update job application: ${error.message}`);
    }

    return data ? formatApplication(data) : null;
  },

  async updateOne(filter: any, update: any): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const id = filter._id || filter.id;
    if (id) {
      return this.findByIdAndUpdate(String(id), update);
    }

    const supabase = getSupabaseAdmin();
    const cleanUpdate = update.$set ? { ...update.$set } : { ...update };
    cleanUpdate.updatedAt = new Date().toISOString();

    let query = supabase.from('job_applications').update(cleanUpdate);
    if (filter.jobId) query = query.eq('jobId', filter.jobId);
    if (filter.userId) query = query.eq('userId', filter.userId);

    const { data, error } = await query.select('*');
    if (error) {
      console.error('Error in updateOne:', error);
      throw error;
    }
    return data;
  },

  async countDocuments(filter: any = {}): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();
    let query = supabase.from('job_applications').select('*', { count: 'exact', head: true });

    if (filter.jobId) {
      if (typeof filter.jobId === 'object' && filter.jobId.$in && Array.isArray(filter.jobId.$in)) {
        query = query.in('jobId', filter.jobId.$in);
      } else {
        query = query.eq('jobId', String(filter.jobId));
      }
    }
    if (filter.userId) {
      query = query.eq('userId', String(filter.userId));
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (Array.isArray(filter.$or) && filter.$or.length > 0) {
      const orClauses: string[] = [];
      for (const item of filter.$or) {
        if (item.candidateName?.$regex) orClauses.push(`candidateName.ilike.%${item.candidateName.$regex}%`);
        if (item.fileName?.$regex) orClauses.push(`fileName.ilike.%${item.fileName.$regex}%`);
      }
      if (orClauses.length > 0) query = query.or(orClauses.join(','));
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error counting applications in Supabase:', error);
      return 0;
    }
    return count || 0;
  },

  async aggregate(pipeline: any[]): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();

    const matchStage = pipeline.find((p) => p.$match)?.$match;
    const groupStage = pipeline.find((p) => p.$group)?.$group;

    if (groupStage && groupStage._id === '$status') {
      let query = supabase.from('job_applications').select('status');
      if (matchStage) {
        if (matchStage.jobId?.$in && Array.isArray(matchStage.jobId.$in)) {
          query = query.in('jobId', matchStage.jobId.$in);
        } else if (matchStage.jobId) {
          query = query.eq('jobId', String(matchStage.jobId));
        }
        if (matchStage.userId) {
          query = query.eq('userId', String(matchStage.userId));
        }
      }

      const { data, error } = await query;
      if (error || !data) return [];

      const counts: Record<string, number> = {};
      for (const item of data) {
        const s = item.status || 'pending';
        counts[s] = (counts[s] || 0) + 1;
      }
      return Object.entries(counts).map(([_id, count]) => ({ _id, count }));
    }

    if (pipeline.some((p) => p.$lookup)) {
      let query = supabase
        .from('job_applications')
        .select('id, status, candidateName, createdAt, jobs!job_applications_jobId_fkey(title, companyName), users!job_applications_userId_fkey(name, email)')
        .order('createdAt', { ascending: false })
        .limit(5);

      if (matchStage) {
        if (matchStage.jobId?.$in && Array.isArray(matchStage.jobId.$in)) {
          query = query.in('jobId', matchStage.jobId.$in);
        } else if (matchStage.jobId) {
          query = query.eq('jobId', String(matchStage.jobId));
        }
        if (matchStage.userId) {
          query = query.eq('userId', String(matchStage.userId));
        }
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        _id: item.id,
        status: item.status,
        createdAt: item.createdAt,
        candidateName: item.users?.name || item.candidateName || 'Unknown Candidate',
        jobInfo: {
          title: item.jobs?.title || 'Unknown Job',
          companyName: item.jobs?.companyName || 'Unknown Company',
        },
        userInfo: {
          name: item.users?.name || 'Unknown User',
          email: item.users?.email || 'Unknown Email',
        },
      }));
    }

    return [];
  },
};

export default JobApplication;
