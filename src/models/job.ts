import { getSupabaseAdmin } from '@/lib/supabase';
import { IUser } from './user';

export interface IJob {
  id: string;
  _id: string;
  title: string;
  description: string;
  companyName: string;
  expiryDate: Date;
  location: string;
  salary?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  urlId: string;
  recruiter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isActive: boolean;
  interviewDuration: number;
  createdAt: Date;
  updatedAt: Date;
  toJSON?: () => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function formatJob(row: any): IJob { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!row) return row;
  const id = String(row.id || row._id);

  let recruiterVal = row.recruiter;
  if (row.users) {
    recruiterVal = {
      id: String(row.users.id),
      _id: String(row.users.id),
      name: row.users.name,
      email: row.users.email,
    };
  }

  const job: IJob = {
    id,
    _id: id,
    title: row.title || '',
    description: row.description || '',
    companyName: row.companyName || row.company_name || '',
    expiryDate: new Date(row.expiryDate || row.expiry_date || Date.now()),
    location: row.location || '',
    salary: row.salary || undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    requirements: row.requirements || undefined,
    benefits: row.benefits || undefined,
    urlId: row.urlId || row.url_id || '',
    recruiter: recruiterVal,
    isActive: row.isActive !== false,
    interviewDuration: Number(row.interviewDuration || row.interview_duration || 15),
    createdAt: new Date(row.createdAt || row.created_at || Date.now()),
    updatedAt: new Date(row.updatedAt || row.updated_at || Date.now()),
    toJSON: function () {
      const copy = { ...this };
      delete copy.toJSON;
      return copy;
    },
  };
  return job;
}

class JobQuery<T = IJob | IJob[] | null> implements PromiseLike<T> {
  private filter: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private isSingle: boolean;
  private shouldPopulateRecruiter = false;
  private selectedFields?: string;
  private _limit?: number;
  private _skip?: number;
  private _sort?: Record<string, number>;

  constructor(filter: any = {}, isSingle = false) { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.filter = filter;
    this.isSingle = isSingle;
  }

  populate(path: string, fields?: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (path === 'recruiter') {
      this.shouldPopulateRecruiter = true;
    }
    return this;
  }

  select(fields: string) {
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
    const selectQuery = this.shouldPopulateRecruiter ? '*, users!jobs_recruiter_fkey(id, name, email)' : '*';
    let query = supabase.from('jobs').select(selectQuery);

    if (this.filter) {
      if (this.filter._id) {
        query = query.eq('id', this.filter._id);
      }
      if (this.filter.id) {
        query = query.eq('id', this.filter.id);
      }
      if (this.filter.urlId) {
        query = query.eq('urlId', this.filter.urlId);
      }
      if (this.filter.recruiter) {
        query = query.eq('recruiter', String(this.filter.recruiter));
      }
      if (typeof this.filter.isActive === 'boolean') {
        query = query.eq('isActive', this.filter.isActive);
      }
      if (this.filter.location) {
        query = query.ilike('location', `%${this.filter.location}%`);
      }
      if (this.filter.skills && this.filter.skills.$in && Array.isArray(this.filter.skills.$in)) {
        query = query.overlaps('skills', this.filter.skills.$in);
      }
      // $or search
      if (Array.isArray(this.filter.$or) && this.filter.$or.length > 0) {
        const orClauses: string[] = [];
        for (const item of this.filter.$or) {
          if (item.title?.$regex) {
            orClauses.push(`title.ilike.%${item.title.$regex}%`);
          }
          if (item.companyName?.$regex) {
            orClauses.push(`companyName.ilike.%${item.companyName.$regex}%`);
          }
          if (item.description?.$regex) {
            orClauses.push(`description.ilike.%${item.description.$regex}%`);
          }
        }
        if (orClauses.length > 0) {
          query = query.or(orClauses.join(','));
        }
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
        console.error('Error fetching job from Supabase:', error);
        return null as unknown as T;
      }
      if (!data) return null as unknown as T;
      return formatJob(data) as unknown as T;
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching jobs from Supabase:', error);
      return [] as unknown as T;
    }

    const formatted = (data || []).map((row) => formatJob(row));
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

export const Job = {
  findById(id: string) {
    return new JobQuery<IJob | null>({ id }, true);
  },

  findOne(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new JobQuery<IJob | null>(filter, true);
  },

  find(filter: any = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return new JobQuery<IJob[]>(filter, false);
  },

  async create(data: {
    title: string;
    description: string;
    companyName: string;
    expiryDate: Date | string;
    location: string;
    salary?: string;
    skills: string[];
    requirements?: string;
    benefits?: string;
    urlId: string;
    recruiter: string | IUser;
    isActive?: boolean;
    interviewDuration?: number;
  }): Promise<IJob> {
    const supabase = getSupabaseAdmin();

    const recruiterId = typeof data.recruiter === 'object' && data.recruiter !== null && 'id' in data.recruiter
      ? String(data.recruiter.id)
      : String(data.recruiter);

    const insertData = {
      title: data.title,
      description: data.description,
      companyName: data.companyName,
      expiryDate: new Date(data.expiryDate).toISOString(),
      location: data.location,
      salary: data.salary || null,
      skills: Array.isArray(data.skills) ? data.skills : [],
      requirements: data.requirements || null,
      benefits: data.benefits || null,
      urlId: data.urlId,
      recruiter: recruiterId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      interviewDuration: data.interviewDuration || 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('jobs')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating job in Supabase:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return formatJob(created);
  },

  async findByIdAndUpdate(
    id: string,
    update: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options: { new?: boolean } = { new: true } // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<IJob | null> {
    const supabase = getSupabaseAdmin();
    const cleanUpdate = update.$set ? { ...update.$set } : { ...update };

    if (cleanUpdate.expiryDate) {
      cleanUpdate.expiryDate = new Date(cleanUpdate.expiryDate).toISOString();
    }
    cleanUpdate.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('jobs')
      .update(cleanUpdate)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error updating job in Supabase:', error);
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data ? formatJob(data) : null;
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting job in Supabase:', error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
    return true;
  },

  async countDocuments(filter: any = {}): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const supabase = getSupabaseAdmin();
    let query = supabase.from('jobs').select('*', { count: 'exact', head: true });

    if (typeof filter.isActive === 'boolean') {
      query = query.eq('isActive', filter.isActive);
    }
    if (filter.recruiter) {
      query = query.eq('recruiter', String(filter.recruiter));
    }
    if (Array.isArray(filter.$or) && filter.$or.length > 0) {
      const orClauses: string[] = [];
      for (const item of filter.$or) {
        if (item.title?.$regex) orClauses.push(`title.ilike.%${item.title.$regex}%`);
        if (item.companyName?.$regex) orClauses.push(`companyName.ilike.%${item.companyName.$regex}%`);
        if (item.description?.$regex) orClauses.push(`description.ilike.%${item.description.$regex}%`);
      }
      if (orClauses.length > 0) query = query.or(orClauses.join(','));
    }

    const { count, error } = await query;
    if (error) {
      console.error('Error counting jobs in Supabase:', error);
      return 0;
    }
    return count || 0;
  },

  async aggregate(pipeline: any[]): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Used in dashboard/stats/route.ts for jobsPerRecruiter
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('jobs')
      .select('recruiter, users!jobs_recruiter_fkey(name)')
      .eq('isActive', true);

    if (error || !data) return [];

    const counts: Record<string, number> = {};
    for (const item of data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recruiterName = (item.users as any)?.name || 'Unknown Recruiter';
      counts[recruiterName] = (counts[recruiterName] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
};

export default Job;
